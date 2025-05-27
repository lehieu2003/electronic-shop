'use client';
import { DashboardSidebar } from '@/components/index';
import React, { useEffect, useState } from 'react';
import {
  FaArrowUp,
  FaArrowDown,
  FaUsers,
  FaBoxOpen,
  FaMoneyBillWave,
} from 'react-icons/fa';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import toast from 'react-hot-toast';

// Types for our data
interface Product {
  id: string;
  title: string;
  price: number;
  inStock: number;
  categoryId: string;
}

interface Order {
  id: string;
  dateTime: string;
  status: string;
  total: number;
}

interface User {
  id: string;
  email: string;
  role: string;
}

// Helper functions for data analysis
const getMonthlyRevenue = (orders: Order[]) => {
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      name: date.toLocaleString('default', { month: 'short' }),
      revenue: 0,
      month: date.getMonth(),
      year: date.getFullYear(),
    };
  }).reverse();

  orders.forEach((order) => {
    const orderDate = new Date(order.dateTime);
    const monthIndex = last6Months.findIndex(
      (m) =>
        m.month === orderDate.getMonth() && m.year === orderDate.getFullYear()
    );
    if (monthIndex !== -1) {
      last6Months[monthIndex].revenue += order.total;
    }
  });

  return last6Months;
};

const getOrderStatusData = (orders: Order[]) => {
  const statusCounts = {
    processing: 0,
    delivered: 0,
    canceled: 0,
  };

  orders.forEach((order) => {
    if (statusCounts.hasOwnProperty(order.status)) {
      statusCounts[order.status as keyof typeof statusCounts]++;
    }
  });

  return Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
  }));
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminDashboardPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<any[]>([]);
  const [revenueChangePercent, setRevenueChangePercent] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch products
      const productsResponse = await fetch(
        'http://localhost:3001/api/products?mode=admin'
      );
      const productsData = await productsResponse.json();
      setProducts(productsData);

      // Fetch orders
      const ordersResponse = await fetch('http://localhost:3001/api/orders');
      const ordersData = await ordersResponse.json();
      setOrders(ordersData);

      // Fetch users
      const usersResponse = await fetch('http://localhost:3001/api/users');
      const usersData = await usersResponse.json();
      setUsers(usersData);

      // Process data for charts
      const monthlyData = getMonthlyRevenue(ordersData);
      setMonthlyRevenue(monthlyData);

      const statusData = getOrderStatusData(ordersData);
      setOrderStatusData(statusData);

      // Calculate total revenue
      const total = ordersData.reduce(
        (sum: number, order: Order) => sum + order.total,
        0
      );
      setTotalRevenue(total);

      // Calculate revenue change percent (comparing last two months)
      if (monthlyData.length >= 2) {
        const currentMonth = monthlyData[monthlyData.length - 1].revenue;
        const previousMonth = monthlyData[monthlyData.length - 2].revenue;

        if (previousMonth > 0) {
          const changePercent =
            ((currentMonth - previousMonth) / previousMonth) * 100;
          setRevenueChangePercent(changePercent);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const lowStockProducts = products.filter(
    (product) => product.inStock === 0
  ).length;
  const adminUsers = users.filter((user) => user.role === 'admin').length;
  const customerUsers = users.filter((user) => user.role === 'user').length;
  const pendingOrders = orders.filter(
    (order) => order.status === 'processing'
  ).length;

  return (
    <div className='flex justify-start max-w-screen-2xl mx-auto max-xl:flex-col'>
      <DashboardSidebar />
      <div className='flex-1 p-6 space-y-6'>
        <h1 className='text-3xl font-bold mb-6'>Dashboard Overview</h1>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {/* Revenue Card */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Revenue
              </CardTitle>
              <FaMoneyBillWave className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className='h-10 w-full' />
              ) : (
                <>
                  <div className='text-2xl font-bold'>
                    ${totalRevenue.toFixed(2)}
                  </div>
                  <p
                    className={`text-xs flex items-center ${
                      revenueChangePercent >= 0
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}
                  >
                    {revenueChangePercent >= 0 ? (
                      <FaArrowUp className='mr-1' />
                    ) : (
                      <FaArrowDown className='mr-1' />
                    )}
                    {Math.abs(revenueChangePercent).toFixed(1)}% from last month
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Products Card */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Products</CardTitle>
              <FaBoxOpen className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className='h-10 w-full' />
              ) : (
                <>
                  <div className='text-2xl font-bold'>{products.length}</div>
                  <p className='text-xs text-red-500'>
                    {lowStockProducts} out of stock
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Users Card */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
              <FaUsers className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className='h-10 w-full' />
              ) : (
                <>
                  <div className='text-2xl font-bold'>{users.length}</div>
                  <p className='text-xs text-muted-foreground'>
                    {adminUsers} admins, {customerUsers} customers
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Orders Card */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Recent Orders
              </CardTitle>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                className='h-4 w-4 text-muted-foreground'
              >
                <path d='M16 6v16m-8-8h16M8 2h8' />
              </svg>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className='h-10 w-full' />
              ) : (
                <>
                  <div className='text-2xl font-bold'>{orders.length}</div>
                  <p className='text-xs text-amber-500'>
                    {pendingOrders} pending orders
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Tabs */}
        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='sales'>Sales Analytics</TabsTrigger>
            <TabsTrigger value='orders'>Orders</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value='overview' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>
                  Monthly revenue for the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent className='h-80'>
                {isLoading ? (
                  <div className='flex items-center justify-center h-full'>
                    <Skeleton className='h-full w-full' />
                  </div>
                ) : (
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart
                      data={monthlyRevenue}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='name' />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`$${value}`, 'Revenue']}
                      />
                      <Legend />
                      <Bar dataKey='revenue' fill='#8884d8' name='Revenue' />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value='sales' className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue Trend</CardTitle>
                  <CardDescription>
                    Revenue trend over the last 6 months
                  </CardDescription>
                </CardHeader>
                <CardContent className='h-80'>
                  {isLoading ? (
                    <div className='flex items-center justify-center h-full'>
                      <Skeleton className='h-full w-full' />
                    </div>
                  ) : (
                    <ResponsiveContainer width='100%' height='100%'>
                      <LineChart
                        data={monthlyRevenue}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis dataKey='name' />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [`$${value}`, 'Revenue']}
                        />
                        <Legend />
                        <Line
                          type='monotone'
                          dataKey='revenue'
                          stroke='#8884d8'
                          activeDot={{ r: 8 }}
                          name='Revenue'
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Selling Categories</CardTitle>
                  <CardDescription>
                    Most popular product categories
                  </CardDescription>
                </CardHeader>
                <CardContent className='h-80'>
                  {isLoading ? (
                    <div className='flex items-center justify-center h-full'>
                      <Skeleton className='h-full w-full' />
                    </div>
                  ) : (
                    <div className='flex flex-col items-center justify-center h-full'>
                      <p className='text-muted-foreground text-center'>
                        Coming soon...
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value='orders' className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <Card>
                <CardHeader>
                  <CardTitle>Order Status</CardTitle>
                  <CardDescription>
                    Distribution of orders by status
                  </CardDescription>
                </CardHeader>
                <CardContent className='h-80'>
                  {isLoading ? (
                    <div className='flex items-center justify-center h-full'>
                      <Skeleton className='h-full w-full' />
                    </div>
                  ) : (
                    <ResponsiveContainer width='100%' height='100%'>
                      <PieChart>
                        <Pie
                          data={orderStatusData}
                          cx='50%'
                          cy='50%'
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill='#8884d8'
                          dataKey='value'
                        >
                          {orderStatusData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, 'Orders']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest 5 orders</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className='space-y-2'>
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className='h-12 w-full' />
                      ))}
                    </div>
                  ) : (
                    <div className='space-y-2'>
                      {orders.slice(0, 5).map((order) => (
                        <div
                          key={order.id}
                          className='flex justify-between items-center border-b pb-2'
                        >
                          <div>
                            <p className='font-medium'>Order #{order.id}</p>
                            <p className='text-xs text-muted-foreground'>
                              {new Date(order.dateTime).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                order.status === 'processing'
                                  ? 'bg-blue-100 text-blue-800'
                                  : order.status === 'delivered'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {order.status}
                            </span>
                            <p className='text-sm font-medium text-right mt-1'>
                              ${order.total}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Additional Information Card */}
        <Card className='bg-white text-black mt-6'>
          <CardContent className='py-6'>
            <h3 className='text-xl font-bold mb-2'>Quick Summary</h3>
            <div className='grid gap-4 md:grid-cols-3'>
              <div>
                <p className='text-black/80'>Total Revenue</p>
                <p className='text-2xl font-bold'>
                  {isLoading ? (
                    <Skeleton className='h-8 w-24 bg-black/20' />
                  ) : (
                    `$${totalRevenue.toFixed(2)}`
                  )}
                </p>
              </div>
              <div>
                <p className='text-black/80'>Avg. Order Value</p>
                <p className='text-2xl font-bold'>
                  {isLoading ? (
                    <Skeleton className='h-8 w-24 bg-black/20' />
                  ) : (
                    `$${
                      orders.length
                        ? (totalRevenue / orders.length).toFixed(2)
                        : '0.00'
                    }`
                  )}
                </p>
              </div>
              <div>
                <p className='text-black/80'>Conversion Rate</p>
                <p className='text-2xl font-bold'>
                  {isLoading ? (
                    <Skeleton className='h-8 w-24 bg-black/20' />
                  ) : (
                    '12.5%'
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
