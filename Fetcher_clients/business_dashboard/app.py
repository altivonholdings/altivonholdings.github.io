import os
import sqlite3
import pandas as pd
import plotly
import plotly.express as px
import plotly.graph_objs as go
from flask import Flask, render_template, request, jsonify, g
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import json

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///businesses.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ------------------- Database Model -------------------
class Business(db.Model):
    __tablename__ = 'businesses'
    id = db.Column(db.Integer, primary_key=True)
    data_id = db.Column(db.String, unique=True)
    name = db.Column(db.String)
    category = db.Column(db.String)
    location = db.Column(db.String)
    phone = db.Column(db.String)
    website = db.Column(db.String)
    rating = db.Column(db.Float)
    reviews = db.Column(db.Integer)
    address = db.Column(db.String)
    hours = db.Column(db.String)
    gps_coordinates = db.Column(db.String)
    fetched_at = db.Column(db.DateTime, server_default=db.func.now())

# ------------------- Helper Functions -------------------
def get_filtered_query(args):
    """Build base query with filters from request args."""
    query = Business.query
    if 'category' in args and args['category']:
        query = query.filter(Business.category == args['category'])
    if 'location' in args and args['location']:
        query = query.filter(Business.location == args['location'])
    if 'min_rating' in args and args['min_rating']:
        query = query.filter(Business.rating >= float(args['min_rating']))
    if 'has_phone' in args and args['has_phone'] == 'yes':
        query = query.filter(Business.phone.isnot(None))
    if 'has_website' in args and args['has_website'] == 'yes':
        query = query.filter(Business.website.isnot(None))
    return query

# ------------------- Routes -------------------
@app.route('/')
def index():
    """Dashboard home with key metrics and quick charts."""
    total_businesses = Business.query.count()
    total_categories = db.session.query(Business.category).distinct().count()
    total_locations = db.session.query(Business.location).distinct().count()
    businesses_with_phone = Business.query.filter(Business.phone.isnot(None)).count()
    businesses_with_website = Business.query.filter(Business.website.isnot(None)).count()
    avg_rating = db.session.query(db.func.avg(Business.rating)).scalar() or 0

    return render_template('index.html',
                           total_businesses=total_businesses,
                           total_categories=total_categories,
                           total_locations=total_locations,
                           businesses_with_phone=businesses_with_phone,
                           businesses_with_website=businesses_with_website,
                           avg_rating=round(avg_rating, 2))

@app.route('/data')
def data():
    """Paginated data table with filters."""
    page = request.args.get('page', 1, type=int)
    per_page = 20

    # Apply filters
    query = get_filtered_query(request.args)
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    businesses = pagination.items

    # Get distinct categories and locations for filter dropdowns
    categories = db.session.query(Business.category).distinct().all()
    locations = db.session.query(Business.location).distinct().all()

    return render_template('data.html',
                           businesses=businesses,
                           pagination=pagination,
                           categories=[c[0] for c in categories],
                           locations=[l[0] for l in locations],
                           filters=request.args)

@app.route('/charts')
def charts():
    """Generate multiple charts based on current filters."""
    # Get filtered data as DataFrame
    query = get_filtered_query(request.args)
    df = pd.read_sql(query.statement, query.session.bind)

    charts_html = {}

    if not df.empty:
        # 1. Bar chart: Business count by category
        fig1 = px.bar(df['category'].value_counts().reset_index(),
                      x='category', y='count', title='Businesses by Category')
        charts_html['cat_bar'] = json.dumps(fig1, cls=plotly.utils.PlotlyJSONEncoder)

        # 2. Pie chart: Location distribution
        fig2 = px.pie(df, names='location', title='Businesses by Location')
        charts_html['loc_pie'] = json.dumps(fig2, cls=plotly.utils.PlotlyJSONEncoder)

        # 3. Histogram: Rating distribution
        fig3 = px.histogram(df, x='rating', nbins=10, title='Rating Distribution')
        charts_html['rating_hist'] = json.dumps(fig3, cls=plotly.utils.PlotlyJSONEncoder)

        # 4. Scatter: Rating vs Reviews
        fig4 = px.scatter(df, x='rating', y='reviews', color='category',
                          title='Rating vs Reviews', hover_data=['name'])
        charts_html['rating_reviews_scatter'] = json.dumps(fig4, cls=plotly.utils.PlotlyJSONEncoder)

        # 5. Bar: Top 10 businesses by reviews
        top_reviews = df.nlargest(10, 'reviews')[['name', 'reviews']]
        fig5 = px.bar(top_reviews, x='name', y='reviews', title='Top 10 by Reviews')
        charts_html['top_reviews'] = json.dumps(fig5, cls=plotly.utils.PlotlyJSONEncoder)

        # 6. Pie: Phone availability
        phone_counts = df['phone'].notna().value_counts().rename(index={True: 'Has Phone', False: 'No Phone'})
        fig6 = px.pie(values=phone_counts.values, names=phone_counts.index, title='Phone Availability')
        charts_html['phone_pie'] = json.dumps(fig6, cls=plotly.utils.PlotlyJSONEncoder)

        # 7. Pie: Website availability
        web_counts = df['website'].notna().value_counts().rename(index={True: 'Has Website', False: 'No Website'})
        fig7 = px.pie(values=web_counts.values, names=web_counts.index, title='Website Availability')
        charts_html['website_pie'] = json.dumps(fig7, cls=plotly.utils.PlotlyJSONEncoder)

        # 8. Box plot: Rating by category
        fig8 = px.box(df, x='category', y='rating', title='Rating Distribution by Category')
        charts_html['rating_box'] = json.dumps(fig8, cls=plotly.utils.PlotlyJSONEncoder)

        # 9. Heatmap: Correlation (if numeric columns exist)
        numeric_df = df[['rating', 'reviews']].dropna()
        if not numeric_df.empty and len(numeric_df) > 1:
            corr = numeric_df.corr()
            fig9 = px.imshow(corr, text_auto=True, title='Correlation: Rating vs Reviews')
            charts_html['corr_heatmap'] = json.dumps(fig9, cls=plotly.utils.PlotlyJSONEncoder)

        # 10. Line: Cumulative businesses over time (if fetched_at exists)
        if 'fetched_at' in df.columns:
            df['fetched_at'] = pd.to_datetime(df['fetched_at'])
            time_series = df.set_index('fetched_at').resample('D').size().cumsum()
            fig10 = px.line(x=time_series.index, y=time_series.values,
                            title='Cumulative Businesses Over Time')
            charts_html['cumulative_line'] = json.dumps(fig10, cls=plotly.utils.PlotlyJSONEncoder)

        # 11. Bar: Reviews sum by location
        reviews_by_loc = df.groupby('location')['reviews'].sum().reset_index()
        fig11 = px.bar(reviews_by_loc, x='location', y='reviews', title='Total Reviews by Location')
        charts_html['reviews_loc'] = json.dumps(fig11, cls=plotly.utils.PlotlyJSONEncoder)

        # 12. Violin: Rating distribution by location
        fig12 = px.violin(df, x='location', y='rating', box=True, title='Rating Distribution by Location')
        charts_html['rating_violin'] = json.dumps(fig12, cls=plotly.utils.PlotlyJSONEncoder)

        # 13. Map: if GPS coordinates available
        if 'gps_coordinates' in df.columns:
            # Extract lat/lon from string (assuming format like {'lat': xx, 'lng': xx})
            df['lat'] = df['gps_coordinates'].apply(lambda x: eval(x).get('lat') if x else None)
            df['lon'] = df['gps_coordinates'].apply(lambda x: eval(x).get('lng') if x else None)
            map_df = df.dropna(subset=['lat', 'lon'])
            if not map_df.empty:
                fig13 = px.scatter_mapbox(map_df, lat='lat', lon='lon', hover_name='name',
                                          color='category', zoom=8,
                                          title='Business Locations')
                fig13.update_layout(mapbox_style="open-street-map")
                charts_html['map'] = json.dumps(fig13, cls=plotly.utils.PlotlyJSONEncoder)

    # Get filter options for the sidebar
    categories = db.session.query(Business.category).distinct().all()
    locations = db.session.query(Business.location).distinct().all()

    return render_template('charts.html',
                           charts_html=charts_html,
                           categories=[c[0] for c in categories],
                           locations=[l[0] for l in locations],
                           filters=request.args)

@app.route('/analysis')
def analysis():
    """Parametric analysis: 50+ combinations of filters and statistics."""
    query = get_filtered_query(request.args)
    df = pd.read_sql(query.statement, query.session.bind)

    stats = {}
    if not df.empty:
        stats['total'] = len(df)
        stats['avg_rating'] = round(df['rating'].mean(), 2) if 'rating' in df else 0
        stats['median_rating'] = round(df['rating'].median(), 2) if 'rating' in df else 0
        stats['total_reviews'] = int(df['reviews'].sum()) if 'reviews' in df else 0
        stats['avg_reviews'] = round(df['reviews'].mean(), 2) if 'reviews' in df else 0
        stats['phone_present'] = int(df['phone'].notna().sum())
        stats['phone_missing'] = int(df['phone'].isna().sum())
        stats['website_present'] = int(df['website'].notna().sum())
        stats['website_missing'] = int(df['website'].isna().sum())
        stats['rating_high'] = len(df[df['rating'] >= 4.5]) if 'rating' in df else 0
        stats['rating_low'] = len(df[df['rating'] < 3.0]) if 'rating' in df else 0

        # Category-wise breakdown
        if 'category' in df.columns:
            cat_counts = df['category'].value_counts().to_dict()
            stats['category_counts'] = cat_counts

        # Location-wise breakdown
        if 'location' in df.columns:
            loc_counts = df['location'].value_counts().to_dict()
            stats['location_counts'] = loc_counts

    # Get filter options
    categories = db.session.query(Business.category).distinct().all()
    locations = db.session.query(Business.location).distinct().all()

    return render_template('analysis.html',
                           stats=stats,
                           categories=[c[0] for c in categories],
                           locations=[l[0] for l in locations],
                           filters=request.args)

# ------------------- Optional OpenRouter Integration -------------------
@app.route('/api/ai_insights', methods=['POST'])
def ai_insights():
    """Use OpenRouter to generate insights about the data (optional)."""
    if not os.getenv('OPENROUTER_API_KEY'):
        return jsonify({'error': 'OpenRouter API key not configured'}), 400

    # Get filtered data
    query = get_filtered_query(request.args)
    df = pd.read_sql(query.statement, query.session.bind)
    if df.empty:
        return jsonify({'insights': 'No data available.'})

    # Prepare a summary for the AI
    summary = f"""
    Total businesses: {len(df)}
    Categories: {df['category'].nunique()}
    Locations: {df['location'].nunique()}
    Average rating: {df['rating'].mean():.2f}
    Total reviews: {df['reviews'].sum()}
    Businesses with phone: {df['phone'].notna().sum()}
    Businesses with website: {df['website'].notna().sum()}
    """

    # Call OpenRouter (example using OpenAI-compatible endpoint)
    import requests
    headers = {
        'Authorization': f'Bearer {os.getenv("OPENROUTER_API_KEY")}',
        'Content-Type': 'application/json'
    }
    payload = {
        'model': 'openai/gpt-4o-mini',  # or any model you prefer
        'messages': [
            {'role': 'system', 'content': 'You are a business analyst. Provide insights and recommendations based on the data summary.'},
            {'role': 'user', 'content': f'Here is the data summary:\n{summary}\nWhat are the key insights and potential leads?'}
        ],
        'temperature': 0.3
    }
    try:
        resp = requests.post('https://openrouter.ai/api/v1/chat/completions', headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        insights = data['choices'][0]['message']['content']
        return jsonify({'insights': insights})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)