import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
import json
import numpy as np

class AnalyticsProcessor:
    def __init__(self):
        self.colors = {
            'approved': '#16a34a',  # Green
            'rejected': '#dc2626',  # Red
            'pending': '#f59e0b',  # Yellow
            'urgent': '#dc2626'     # Red
        }
    
    def generate_pie_chart(self, data, title="Request Status Distribution"):
        """Generate pie chart for request status distribution"""
        fig, ax = plt.subplots(figsize=(8, 6))
        
        labels = list(data.keys())
        sizes = list(data.values())
        colors = [self.colors.get(label.lower(), '#6b7280') for label in labels]
        
        wedges, texts, autotexts = ax.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', startangle=90)
        
        # Enhance text appearance
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontweight('bold')
        
        ax.set_title(title, fontsize=14, fontweight='bold')
        plt.tight_layout()
        
        return fig
    
    def generate_timeline_chart(self, requests_data, title="Request Timeline"):
        """Generate timeline chart showing request status over time"""
        fig, ax = plt.subplots(figsize=(12, 6))
        
        # Convert to DataFrame for easier manipulation
        df = pd.DataFrame(requests_data)
        df['created_at'] = pd.to_datetime(df['created_at'])
        df['date'] = df['created_at'].dt.date
        
        # Group by date and status
        timeline_data = df.groupby(['date', 'status']).size().unstack(fill_value=0)
        
        # Create stacked bar chart
        timeline_data.plot(kind='bar', stacked=True, ax=ax, 
                          color=[self.colors.get(status, '#6b7280') for status in timeline_data.columns])
        
        ax.set_title(title, fontsize=14, fontweight='bold')
        ax.set_xlabel('Date', fontsize=12)
        ax.set_ylabel('Number of Requests', fontsize=12)
        ax.legend(title='Status', bbox_to_anchor=(1.05, 1), loc='upper left')
        
        # Rotate x-axis labels for better readability
        plt.xticks(rotation=45)
        plt.tight_layout()
        
        return fig
    
    def generate_amount_analysis(self, requests_data, title="Amount Analysis"):
        """Generate analysis of request amounts"""
        df = pd.DataFrame(requests_data)
        
        # Filter approved requests for amount analysis
        approved_df = df[df['status'] == 'approved'].copy()
        
        if approved_df.empty:
            return None
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
        
        # Amount distribution histogram
        ax1.hist(approved_df['amount'], bins=20, color=self.colors['approved'], alpha=0.7, edgecolor='black')
        ax1.set_title('Amount Distribution', fontweight='bold')
        ax1.set_xlabel('Amount')
        ax1.set_ylabel('Frequency')
        
        # Category-wise amount analysis
        if 'category' in approved_df.columns:
            category_amounts = approved_df.groupby('category')['amount'].sum().sort_values(ascending=True)
            category_amounts.plot(kind='barh', ax=ax2, color=self.colors['approved'])
            ax2.set_title('Amount by Category', fontweight='bold')
            ax2.set_xlabel('Total Amount')
        
        plt.tight_layout()
        return fig
    
    def generate_approval_time_analysis(self, requests_data, title="Approval Time Analysis"):
        """Generate analysis of approval times"""
        df = pd.DataFrame(requests_data)
        
        # Calculate approval times for approved requests
        approved_df = df[df['status'] == 'approved'].copy()
        
        if approved_df.empty:
            return None
        
        # Convert timestamps
        approved_df['created_at'] = pd.to_datetime(approved_df['created_at'])
        approved_df['approved_at'] = pd.to_datetime(approved_df['approved_at'])
        approved_df['approval_time_hours'] = (approved_df['approved_at'] - approved_df['created_at']).dt.total_seconds() / 3600
        
        fig, ax = plt.subplots(figsize=(10, 6))
        
        # Create histogram of approval times
        ax.hist(approved_df['approval_time_hours'], bins=20, color=self.colors['approved'], alpha=0.7, edgecolor='black')
        ax.set_title(title, fontweight='bold')
        ax.set_xlabel('Approval Time (Hours)')
        ax.set_ylabel('Frequency')
        
        # Add statistics
        mean_time = approved_df['approval_time_hours'].mean()
        median_time = approved_df['approval_time_hours'].median()
        
        ax.axvline(mean_time, color='red', linestyle='--', label=f'Mean: {mean_time:.1f}h')
        ax.axvline(median_time, color='blue', linestyle='--', label=f'Median: {median_time:.1f}h')
        ax.legend()
        
        plt.tight_layout()
        return fig
    
    def generate_dashboard_summary(self, requests_data):
        """Generate comprehensive dashboard summary"""
        df = pd.DataFrame(requests_data)
        
        summary = {
            'total_requests': len(df),
            'approved_requests': len(df[df['status'] == 'approved']),
            'rejected_requests': len(df[df['status'] == 'rejected']),
            'pending_requests': len(df[df['status'] == 'pending']),
            'urgent_requests': len(df[df['urgency'] == 'urgent']),
            'total_amount': df[df['status'] == 'approved']['amount'].sum() if 'amount' in df.columns else 0,
            'average_amount': df[df['status'] == 'approved']['amount'].mean() if 'amount' in df.columns else 0,
            'approval_rate': (len(df[df['status'] == 'approved']) / len(df) * 100) if len(df) > 0 else 0
        }
        
        return summary
    
    def save_chart(self, fig, filename):
        """Save chart to file"""
        fig.savefig(filename, dpi=300, bbox_inches='tight')
        plt.close(fig)
    
    def generate_all_analytics(self, requests_data, output_dir='analytics_output'):
        """Generate all analytics charts and save them"""
        import os
        os.makedirs(output_dir, exist_ok=True)
        
        # Generate summary
        summary = self.generate_dashboard_summary(requests_data)
        
        # Generate pie chart
        pie_data = {
            'Approved': summary['approved_requests'],
            'Rejected': summary['rejected_requests'],
            'Pending': summary['pending_requests']
        }
        pie_fig = self.generate_pie_chart(pie_data)
        self.save_chart(pie_fig, f'{output_dir}/status_distribution.png')
        
        # Generate timeline chart
        timeline_fig = self.generate_timeline_chart(requests_data)
        self.save_chart(timeline_fig, f'{output_dir}/timeline.png')
        
        # Generate amount analysis
        amount_fig = self.generate_amount_analysis(requests_data)
        if amount_fig:
            self.save_chart(amount_fig, f'{output_dir}/amount_analysis.png')
        
        # Generate approval time analysis
        approval_time_fig = self.generate_approval_time_analysis(requests_data)
        if approval_time_fig:
            self.save_chart(approval_time_fig, f'{output_dir}/approval_time.png')
        
        return summary

# Example usage
if __name__ == "__main__":
    # Sample data for testing
    sample_data = [
        {
            'id': '1',
            'amount': 150.50,
            'status': 'approved',
            'category': 'Food & Dining',
            'created_at': '2024-01-01T10:00:00',
            'approved_at': '2024-01-01T14:00:00',
            'urgency': 'normal'
        },
        {
            'id': '2',
            'amount': 75.25,
            'status': 'pending',
            'category': 'Transportation',
            'created_at': '2024-01-02T09:00:00',
            'urgency': 'urgent'
        }
    ]
    
    analytics = AnalyticsProcessor()
    summary = analytics.generate_all_analytics(sample_data)
    print(json.dumps(summary, indent=2))
