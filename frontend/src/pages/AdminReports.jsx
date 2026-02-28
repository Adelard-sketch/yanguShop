import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './AdminReports.css';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend as ReLegend,
} from 'recharts';

const CHART_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

export default function AdminReports() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('month');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check admin access
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    generateReport();
  }, [user, navigate, reportType, dateRange]);

  const generateReport = () => {
    setLoading(true);
    setTimeout(() => {
      generateSampleReport();
      setLoading(false);
    }, 500);
  };

  const generateSampleReport = () => {
    const currentDate = new Date();
    const reports = {
      sales: {
        title: 'Sales Report',
        totalRevenue: 45320.50,
        totalOrders: 156,
        averageOrderValue: 290.39,
        growth: '+18.5%',
        topProducts: [
          { name: 'Nike Air Max 270', sales: 34, revenue: 10186 },
          { name: 'Adidas Ultraboost', sales: 28, revenue: 12599.72 },
          { name: 'Puma Running Shoes', sales: 24, revenue: 4559.76 },
          { name: 'Converse Chuck Taylor', sales: 22, revenue: 1451.78 },
          { name: 'New Balance 990v5', sales: 18, revenue: 6839.82 },
        ],
        salesByDay: [
          { day: 'Mon', sales: 8 },
          { day: 'Tue', sales: 12 },
          { day: 'Wed', sales: 10 },
          { day: 'Thu', sales: 15 },
          { day: 'Fri', sales: 22 },
          { day: 'Sat', sales: 28 },
          { day: 'Sun', sales: 18 },
        ],
      },
      orders: {
        title: 'Orders Report',
        totalOrders: 156,
        pendingOrders: 12,
        confirmedOrders: 34,
        shippedOrders: 45,
        deliveredOrders: 63,
        cancelledOrders: 2,
        averageProcessingTime: '2.4 hours',
        orderStatusChart: [
          { status: 'Delivered', count: 63, percentage: 40.4 },
          { status: 'Shipped', count: 45, percentage: 28.8 },
          { status: 'Confirmed', count: 34, percentage: 21.8 },
          { status: 'Pending', count: 12, percentage: 7.7 },
          { status: 'Cancelled', count: 2, percentage: 1.3 },
        ],
      },
      customers: {
        title: 'Customers Report',
        totalCustomers: 487,
        newCustomers: 45,
        returningCustomers: 442,
        customerRetentionRate: '90.8%',
        averageCustomerValue: 93.03,
        topCustomers: [
          { name: 'Ama Asante', orders: 8, spent: 2340.50 },
          { name: 'Kofi Mensah', orders: 6, spent: 1895.40 },
          { name: 'Yaa Owusu', orders: 5, spent: 1650.75 },
          { name: 'Kwame Boateng', orders: 5, spent: 1445.30 },
          { name: 'Abena Appiah', orders: 4, spent: 1190.95 },
        ],
      },
      products: {
        title: 'Products Report',
        totalProducts: 64,
        activeProducts: 62,
        lowStockProducts: 8,
        outOfStockProducts: 2,
        categoryPerformance: [
          { category: 'Shoes', products: 28, sales: 98, revenue: 28345.50 },
          { category: 'Accessories', products: 18, sales: 35, revenue: 8950.20 },
          { category: 'Clothing', products: 12, sales: 18, revenue: 5320.75 },
          { category: 'Other', products: 6, sales: 5, revenue: 2704.05 },
        ],
      },
      payments: {
        title: 'Payments Report',
        totalTransactions: 156,
        successfulPayments: 152,
        failedPayments: 4,
        totalValueProcessed: 45320.50,
        successRate: '97.4%',
        paymentMethods: [
          { method: 'Card Payment', count: 98, revenue: 28560.40, percentage: 63.0 },
          { method: 'Mobile Money', count: 54, revenue: 16760.10, percentage: 37.0 },
        ],
      },
    };

    setReportData(reports[reportType] || reports.sales);
  };

  const handleExportPDF = () => {
    alert('PDF export functionality would be implemented here');
  };

  const handleExportCSV = () => {
    alert('CSV export functionality would be implemented here');
  };

  if (!reportData) {
    return <div className="admin-reports loading">Loading report...</div>;
  }

  return (
    <div className="admin-reports">
      {/* Header */}
      <div className="reports-header">
        <div className="header-content">
          <h1>Reports & Analytics</h1>
          <p>Track business performance and insights</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleExportPDF}>
            📥 Export PDF
          </button>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="reports-controls">
        <div className="control-group">
          <label>Report Type:</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="sales">Sales Report</option>
            <option value="orders">Orders Report</option>
            <option value="customers">Customers Report</option>
            <option value="products">Products Report</option>
            <option value="payments">Payments Report</option>
          </select>
        </div>

        <div className="control-group">
          <label>Date Range:</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="week">Last 7 Days</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={generateReport} disabled={loading}>
          {loading ? 'Generating...' : 'Refresh Report'}
        </button>
      </div>

      {/* Report Content */}
      <div className="report-container">
        <div className="report-title">
          <h2>{reportData.title}</h2>
          <span className="report-date">
            {dateRange === 'week' && 'Last 7 Days'}
            {dateRange === 'month' && 'This Month'}
            {dateRange === 'quarter' && 'This Quarter'}
            {dateRange === 'year' && 'This Year'}
            {dateRange === 'all' && 'All Time'}
          </span>
        </div>

        {/* Key Metrics */}
        <div className="metrics-grid">
          {reportType === 'sales' && (
            <>
              <div className="metric-card">
                <h3>Total Revenue</h3>
                <p className="metric-value">UGX {reportData.totalRevenue.toFixed(2)}</p>
                <span className="metric-growth">{reportData.growth}</span>
              </div>
              <div className="metric-card">
                <h3>Total Orders</h3>
                <p className="metric-value">{reportData.totalOrders}</p>
                <span className="metric-subtext">orders processed</span>
              </div>
              <div className="metric-card">
                <h3>Avg Order Value</h3>
                <p className="metric-value">UGX {reportData.averageOrderValue.toFixed(2)}</p>
                <span className="metric-subtext">per transaction</span>
              </div>
            </>
          )}

          {reportType === 'orders' && (
            <>
              <div className="metric-card">
                <h3>Total Orders</h3>
                <p className="metric-value">{reportData.totalOrders}</p>
              </div>
              <div className="metric-card">
                <h3>Delivered</h3>
                <p className="metric-value">{reportData.deliveredOrders}</p>
                <span className="metric-subtext">completed</span>
              </div>
              <div className="metric-card">
                <h3>Avg Processing Time</h3>
                <p className="metric-value">{reportData.averageProcessingTime}</p>
              </div>
            </>
          )}

          {reportType === 'customers' && (
            <>
              <div className="metric-card">
                <h3>Total Customers</h3>
                <p className="metric-value">{reportData.totalCustomers}</p>
              </div>
              <div className="metric-card">
                <h3>New Customers</h3>
                <p className="metric-value">{reportData.newCustomers}</p>
              </div>
              <div className="metric-card">
                <h3>Retention Rate</h3>
                <p className="metric-value">{reportData.customerRetentionRate}</p>
              </div>
              <div className="metric-card">
                <h3>Avg Customer Value</h3>
                <p className="metric-value">UGX {reportData.averageCustomerValue.toFixed(2)}</p>
              </div>
            </>
          )}

          {reportType === 'products' && (
            <>
              <div className="metric-card">
                <h3>Total Products</h3>
                <p className="metric-value">{reportData.totalProducts}</p>
              </div>
              <div className="metric-card">
                <h3>Active</h3>
                <p className="metric-value">{reportData.activeProducts}</p>
              </div>
              <div className="metric-card">
                <h3>Low Stock</h3>
                <p className="metric-value">{reportData.lowStockProducts}</p>
              </div>
              <div className="metric-card">
                <h3>Out of Stock</h3>
                <p className="metric-value">{reportData.outOfStockProducts}</p>
              </div>
            </>
          )}

          {reportType === 'payments' && (
            <>
              <div className="metric-card">
                <h3>Total Transactions</h3>
                <p className="metric-value">{reportData.totalTransactions}</p>
              </div>
              <div className="metric-card">
                <h3>Successful</h3>
                <p className="metric-value">{reportData.successfulPayments}</p>
              </div>
              <div className="metric-card">
                <h3>Success Rate</h3>
                <p className="metric-value">{reportData.successRate}</p>
              </div>
              <div className="metric-card">
                <h3>Total Value</h3>
                <p className="metric-value">UGX {reportData.totalValueProcessed.toFixed(2)}</p>
              </div>
            </>
          )}
        </div>

        {/* Charts */}
        <div className="report-charts">
          {reportType === 'sales' && reportData.salesByDay && (
            <div className="chart-card">
              <h3>Sales by Day</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={reportData.salesByDay} margin={{ top: 8, right: 12, left: 0, bottom: 6 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.06} vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <ReTooltip />
                  <Line type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {reportType === 'orders' && reportData.orderStatusChart && (
            <div className="chart-card">
              <h3>Order Status Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={reportData.orderStatusChart}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={36}
                    paddingAngle={4}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {reportData.orderStatusChart.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <ReTooltip formatter={(value) => [value, 'Orders']} />
                  <ReLegend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Detailed Tables */}
        <div className="details-grid">
          {reportType === 'sales' && (
            <>
              <div className="detail-section">
                <h3>Top Products</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Sales</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.topProducts.map((product, idx) => (
                      <tr key={idx}>
                        <td>{product.name}</td>
                        <td>{product.sales}</td>
                        <td>UGX {product.revenue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {reportType === 'orders' && (
            <div className="detail-section">
              <h3>Order Status Distribution</h3>
              <div className="status-bars">
                {reportData.orderStatusChart.map((item, idx) => (
                  <div key={idx} className="status-bar">
                    <div className="bar-label">
                      <span>{item.status}</span>
                      <span>{item.count} ({item.percentage}%)</span>
                    </div>
                    <div className="bar-container">
                      <div
                        className={`bar-fill ${item.status.toLowerCase()}`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reportType === 'customers' && (
            <div className="detail-section">
              <h3>Top Customers</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Orders</th>
                    <th>Total Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.topCustomers.map((customer, idx) => (
                    <tr key={idx}>
                      <td>{customer.name}</td>
                      <td>{customer.orders}</td>
                      <td>UGX {customer.spent.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {reportType === 'products' && (
            <div className="detail-section">
              <h3>Category Performance</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Products</th>
                    <th>Sales</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.categoryPerformance.map((category, idx) => (
                    <tr key={idx}>
                      <td>{category.category}</td>
                      <td>{category.products}</td>
                      <td>{category.sales}</td>
                      <td>UGX {category.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {reportType === 'payments' && (
            <div className="detail-section">
              <h3>Payment Methods Breakdown</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Payment Method</th>
                    <th>Transactions</th>
                    <th>Revenue</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.paymentMethods.map((method, idx) => (
                    <tr key={idx}>
                      <td>{method.method}</td>
                      <td>{method.count}</td>
                      <td>UGX {method.revenue.toFixed(2)}</td>
                      <td>{method.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
