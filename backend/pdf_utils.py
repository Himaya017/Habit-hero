from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from datetime import datetime
from sqlalchemy.orm import Session
from database import Habit, CheckIn
import io

class PDFReportGenerator:
    @staticmethod
    def generate_progress_report(db: Session, habit_ids: list = None) -> bytes:
        """Generate a PDF report of habit progress"""
        
        habits = db.query(Habit).all()
        if habit_ids:
            habits = [h for h in habits if h.id in habit_ids]
        
        # Create PDF in memory
        pdf_buffer = io.BytesIO()
        doc = SimpleDocTemplate(pdf_buffer, pagesize=letter)
        
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#2C3E50'),
            spaceAfter=30
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#34495E'),
            spaceAfter=12
        )
        
        elements = []
        
        # Title
        elements.append(Paragraph("Habit Hero - Progress Report", title_style))
        elements.append(Paragraph(f"Generated on {datetime.now().strftime('%B %d, %Y')}", styles['Normal']))
        elements.append(Spacer(1, 0.3*inch))
        
        # Summary stats
        elements.append(Paragraph("Summary", heading_style))
        summary_data = [
            ['Total Habits', str(len(habits))],
            ['Active Habits', str(len([h for h in habits if h.is_active]))],
            ['Report Date', datetime.now().strftime('%Y-%m-%d')]
        ]
        summary_table = Table(summary_data, colWidths=[2*inch, 2*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#ECF0F1')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(summary_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Individual habit details
        for habit in habits:
            elements.append(PageBreak() if habit != habits[0] else Spacer(1, 0))
            elements.append(Paragraph(f"Habit: {habit.name}", heading_style))
            
            habit_info = [
                ['Category', str(habit.category.value)],
                ['Frequency', str(habit.frequency.value)],
                ['Start Date', habit.start_date.strftime('%Y-%m-%d')],
                ['Status', 'Active' if habit.is_active else 'Inactive']
            ]
            
            if habit.analytics:
                habit_info.extend([
                    ['Current Streak', str(habit.analytics.current_streak)],
                    ['Longest Streak', str(habit.analytics.longest_streak)],
                    ['Total Completions', str(habit.analytics.total_completions)],
                    ['Success Rate', f"{habit.analytics.success_rate:.1f}%"],
                    ['Best Day', habit.analytics.best_day_of_week or 'N/A']
                ])
            
            habit_table = Table(habit_info, colWidths=[2*inch, 2.5*inch])
            habit_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8F9FA')),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, 0), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#BDC3C7'))
            ]))
            elements.append(habit_table)
            elements.append(Spacer(1, 0.2*inch))
        
        # Build PDF
        doc.build(elements)
        pdf_buffer.seek(0)
        return pdf_buffer.getvalue()
