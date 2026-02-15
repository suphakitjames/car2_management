"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { 
  Car, Users, DollarSign, TrendingUp, Plus, Search, Edit, Trash2, 
  Phone, Mail, MapPin, Calendar, Gauge, Fuel, Settings,
  BarChart3, PieChart, Activity, ShoppingCart, FileText,
  ArrowLeft, Home, Image as ImageIcon
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { ImageUploader } from "@/components/image-uploader";

// Types
interface CarData {
  id: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  mileage: number;
  engineSize?: number | null;
  fuelType?: string | null;
  transmission?: string | null;
  plateNumber?: string | null;
  vin?: string | null;
  costPrice: number;
  sellingPrice: number;
  description?: string | null;
  images?: string | null;
  status: "AVAILABLE" | "RESERVED" | "SOLD" | "MAINTENANCE";
  condition?: string | null;
  purchaseDate?: string | null;
  createdAt: string;
  sale?: { customer: CustomerData } | null;
}

interface CustomerData {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  idCard?: string | null;
  note?: string | null;
  createdAt: string;
  contacts?: ContactData[];
  sales?: SaleData[];
}

interface ContactData {
  id: string;
  customerId: string;
  contactType: string;
  note: string;
  followUpDate?: string | null;
  createdAt: string;
}

interface SaleData {
  id: string;
  carId: string;
  customerId: string;
  salePrice: number;
  profit: number;
  paymentType?: string | null;
  note?: string | null;
  saleDate: string;
  car: CarData;
  customer: CustomerData;
}

interface DashboardData {
  summary: {
    totalCars: number;
    availableCars: number;
    reservedCars: number;
    soldCars: number;
    totalCustomers: number;
    totalSales: number;
    totalProfit: number;
    salesCount: number;
    inventoryCostValue: number;
    inventorySellingValue: number;
  };
  monthlySales: Record<string, { sales: number; profit: number; count: number }>;
  topBrands: { brand?: string; model?: string; count: number }[];
  latestSales: SaleData[];
  latestCars: CarData[];
}

// Status badges
const statusConfig = {
  AVAILABLE: { label: "พร้อมขาย", color: "bg-green-500", variant: "default" as const },
  RESERVED: { label: "จองแล้ว", color: "bg-yellow-500", variant: "secondary" as const },
  SOLD: { label: "ขายแล้ว", color: "bg-gray-500", variant: "outline" as const },
  MAINTENANCE: { label: "ซ่อมบำรุง", color: "bg-red-500", variant: "destructive" as const },
};

const COLORS = ["#22c55e", "#eab308", "#6b7280", "#ef4444", "#3b82f6"];

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Data states
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [cars, setCars] = useState<CarData[]>([]);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [sales, setSales] = useState<SaleData[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [searchCar, setSearchCar] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [carDialogOpen, setCarDialogOpen] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  
  // Form states
  const [editingCar, setEditingCar] = useState<CarData | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<CustomerData | null>(null);
  const [selectedCarForSale, setSelectedCarForSale] = useState<CarData | null>(null);
  const [selectedCustomerForContact, setSelectedCustomerForContact] = useState<CustomerData | null>(null);
  const [carImages, setCarImages] = useState<string[]>([]);

  // Fetch functions
  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      const data = await res.json();
      setDashboard(data);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      toast.error("โหลดข้อมูล Dashboard ล้มเหลว");
    }
  }, []);

  const fetchCars = useCallback(async () => {
    try {
      const res = await fetch(`/api/cars?search=${searchCar}`);
      if (!res.ok) throw new Error("Failed to fetch cars");
      const data = await res.json();
      setCars(data);
    } catch (error) {
      console.error("Error fetching cars:", error);
      toast.error("โหลดข้อมูลรถยนต์ล้มเหลว");
    }
  }, [searchCar]);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch(`/api/customers?search=${searchCustomer}`);
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("โหลดข้อมูลลูกค้าล้มเหลว");
    }
  }, [searchCustomer]);

  const fetchSales = useCallback(async () => {
    try {
      const res = await fetch("/api/sales");
      if (!res.ok) throw new Error("Failed to fetch sales");
      const data = await res.json();
      setSales(data);
    } catch (error) {
      console.error("Error fetching sales:", error);
      toast.error("โหลดข้อมูลการขายล้มเหลว");
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchDashboard(), fetchCars(), fetchCustomers(), fetchSales()]);
    setLoading(false);
  }, [fetchDashboard, fetchCars, fetchCustomers, fetchSales]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Car form handlers
  const handleCarSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const carData = {
      brand: formData.get("brand") as string,
      model: formData.get("model") as string,
      year: formData.get("year") as string,
      color: formData.get("color") as string,
      mileage: formData.get("mileage") as string,
      engineSize: formData.get("engineSize") as string,
      fuelType: formData.get("fuelType") as string,
      transmission: formData.get("transmission") as string,
      plateNumber: formData.get("plateNumber") as string,
      vin: formData.get("vin") as string,
      costPrice: formData.get("costPrice") as string,
      sellingPrice: formData.get("sellingPrice") as string,
      description: formData.get("description") as string,
      condition: formData.get("condition") as string,
      status: formData.get("status") as string,
      images: JSON.stringify(carImages),
    };

    try {
      const url = editingCar ? `/api/cars/${editingCar.id}` : "/api/cars";
      const method = editingCar ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(carData),
      });

      if (!res.ok) throw new Error("Failed to save car");

      toast.success(editingCar ? "อัปเดตรถยนต์สำเร็จ" : "เพิ่มรถยนต์สำเร็จ");
      setCarDialogOpen(false);
      setEditingCar(null);
      setCarImages([]);
      fetchCars();
      fetchDashboard();
    } catch (error) {
      console.error("Error saving car:", error);
      toast.error("บันทึกข้อมูลรถยนต์ล้มเหลว");
    }
  };

  const handleDeleteCar = async (id: string) => {
    if (!confirm("ยืนยันการลบรถยนต์คันนี้?")) return;

    try {
      const res = await fetch(`/api/cars/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete car");

      toast.success("ลบรถยนต์สำเร็จ");
      fetchCars();
      fetchDashboard();
    } catch (error) {
      console.error("Error deleting car:", error);
      toast.error("ลบรถยนต์ล้มเหลว");
    }
  };

  // Customer form handlers
  const handleCustomerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const customerData = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      address: formData.get("address") as string,
      idCard: formData.get("idCard") as string,
      note: formData.get("note") as string,
    };

    try {
      const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : "/api/customers";
      const method = editingCustomer ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });

      if (!res.ok) throw new Error("Failed to save customer");

      toast.success(editingCustomer ? "อัปเดตลูกค้าสำเร็จ" : "เพิ่มลูกค้าสำเร็จ");
      setCustomerDialogOpen(false);
      setEditingCustomer(null);
      fetchCustomers();
    } catch (error) {
      console.error("Error saving customer:", error);
      toast.error("บันทึกข้อมูลลูกค้าล้มเหลว");
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("ยืนยันการลบลูกค้าคนนี้?")) return;

    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete customer");

      toast.success("ลบลูกค้าสำเร็จ");
      fetchCustomers();
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("ลบลูกค้าล้มเหลว");
    }
  };

  // Sale form handler
  const handleSaleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const saleData = {
      carId: selectedCarForSale?.id,
      customerId: formData.get("customerId") as string,
      salePrice: formData.get("salePrice") as string,
      paymentType: formData.get("paymentType") as string,
      note: formData.get("note") as string,
    };

    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create sale");
      }

      toast.success("บันทึกการขายสำเร็จ");
      setSaleDialogOpen(false);
      setSelectedCarForSale(null);
      fetchAllData();
    } catch (error) {
      console.error("Error creating sale:", error);
      toast.error(error instanceof Error ? error.message : "บันทึกการขายล้มเหลว");
    }
  };

  // Contact form handler
  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const contactData = {
      customerId: selectedCustomerForContact?.id,
      contactType: formData.get("contactType") as string,
      note: formData.get("note") as string,
      followUpDate: formData.get("followUpDate") as string,
    };

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactData),
      });

      if (!res.ok) throw new Error("Failed to create contact");

      toast.success("บันทึกการติดต่อสำเร็จ");
      setContactDialogOpen(false);
      setSelectedCustomerForContact(null);
      fetchCustomers();
    } catch (error) {
      console.error("Error creating contact:", error);
      toast.error("บันทึกการติดต่อล้มเหลว");
    }
  };

  // Chart data
  const monthlySalesData = dashboard?.monthlySales
    ? Object.entries(dashboard.monthlySales).map(([month, data]) => ({
        month,
        sales: data.sales,
        profit: data.profit,
        count: data.count,
      }))
    : [];

  const pieData = [
    { name: "พร้อมขาย", value: dashboard?.summary.availableCars || 0, color: COLORS[0] },
    { name: "จองแล้ว", value: dashboard?.summary.reservedCars || 0, color: COLORS[1] },
    { name: "ขายแล้ว", value: dashboard?.summary.soldCars || 0, color: COLORS[2] },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">กลับหน้าร้าน</span>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="p-2 bg-primary/10 rounded-lg">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Admin Dashboard</h1>
                <p className="text-xs text-muted-foreground">ระบบจัดการรถมือสอง</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="outline" size="sm" className="gap-2">
                  <Home className="w-4 h-4" />
                  หน้าร้าน
                </Button>
              </Link>
              <Badge variant="outline" className="gap-1">
                <Activity className="w-3 h-3" />
                Admin
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="cars" className="gap-2">
              <Car className="w-4 h-4" />
              <span className="hidden sm:inline">รถยนต์</span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">ลูกค้า</span>
            </TabsTrigger>
            <TabsTrigger value="sales" className="gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">การขาย</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">รถในสต็อก</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboard?.summary.totalCars || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    พร้อมขาย {dashboard?.summary.availableCars || 0} คัน
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ลูกค้าทั้งหมด</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboard?.summary.totalCustomers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    รายชื่อลูกค้าในระบบ
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ยอดขายรวม</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(dashboard?.summary.totalSales || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dashboard?.summary.salesCount || 0} รายการ
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">กำไรรวม</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(dashboard?.summary.totalProfit || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    จากการขายรถ
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>ยอดขายรายเดือน</CardTitle>
                  <CardDescription>แนวโน้มยอดขายและกำไร 6 เดือนล่าสุด</CardDescription>
                </CardHeader>
                <CardContent>
                  {monthlySalesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monthlySalesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `${((value as number) / 1000000).toFixed(0)}M`} />
                        <Legend />
                        <Line type="monotone" dataKey="sales" stroke="#3b82f6" name="ยอดขาย" />
                        <Line type="monotone" dataKey="profit" stroke="#22c55e" name="กำไร" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      ยังไม่มีข้อมูลการขาย
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>สถานะรถในสต็อก</CardTitle>
                  <CardDescription>การกระจายสถานะรถยนต์</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPie>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => ` { name: string; percent: number }) `}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Latest Items */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>การขายล่าสุด</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    {dashboard?.latestSales && dashboard.latestSales.length > 0 ? (
                      <div className="space-y-4">
                        {dashboard.latestSales.map((sale) => (
                          <div key={sale.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div>
                              <p className="font-medium">{sale.car.brand} {sale.car.model}</p>
                              <p className="text-sm text-muted-foreground">ลูกค้า: {sale.customer.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">{formatCurrency(sale.salePrice)}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(sale.saleDate)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        ยังไม่มีการขาย
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>รถเข้าใหม่</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    {dashboard?.latestCars && dashboard.latestCars.length > 0 ? (
                      <div className="space-y-4">
                        {dashboard.latestCars.map((car) => (
                          <div key={car.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div>
                              <p className="font-medium">{car.brand} {car.model} ({car.year})</p>
                              <p className="text-sm text-muted-foreground">
                                {car.mileage.toLocaleString()} km • {car.color}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{formatCurrency(car.sellingPrice)}</p>
                              <Badge variant={statusConfig[car.status].variant}>
                                {statusConfig[car.status].label}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        ยังไม่มีรถในสต็อก
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Inventory Value */}
            <Card>
              <CardHeader>
                <CardTitle>มูลค่าสินค้าคงเหลือ</CardTitle>
                <CardDescription>มูลค่ารถในสต็อกตามราคาทุนและราคาขาย</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">มูลค่าตามราคาทุน</p>
                    <p className="text-2xl font-bold">{formatCurrency(dashboard?.summary.inventoryCostValue || 0)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">มูลค่าตามราคาขาย</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(dashboard?.summary.inventorySellingValue || 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cars Tab */}
          <TabsContent value="cars" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหารถยนต์..."
                  value={searchCar}
                  onChange={(e) => setSearchCar(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Dialog open={carDialogOpen} onOpenChange={(open) => {
                setCarDialogOpen(open);
                if (!open) {
                  setEditingCar(null);
                  setCarImages([]);
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    เพิ่มรถยนต์
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingCar ? "แก้ไขรถยนต์" : "เพิ่มรถยนต์ใหม่"}</DialogTitle>
                    <DialogDescription>
                      กรอกข้อมูลรถยนต์ให้ครบถ้วน
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCarSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="brand">ยี่ห้อ *</Label>
                        <Input id="brand" name="brand" required defaultValue={editingCar?.brand} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="model">รุ่น *</Label>
                        <Input id="model" name="model" required defaultValue={editingCar?.model} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="year">ปี *</Label>
                        <Input id="year" name="year" type="number" required defaultValue={editingCar?.year} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="color">สี *</Label>
                        <Input id="color" name="color" required defaultValue={editingCar?.color} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mileage">เลขไมล์ (km) *</Label>
                        <Input id="mileage" name="mileage" type="number" required defaultValue={editingCar?.mileage} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="engineSize">ขนาดเครื่องยนต์ (cc)</Label>
                        <Input id="engineSize" name="engineSize" type="number" step="0.1" defaultValue={editingCar?.engineSize ?? ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fuelType">ประเภทเชื้อเพลิง</Label>
                        <Select name="fuelType" defaultValue={editingCar?.fuelType ?? ""}>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือก" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="เบนซิน">เบนซิน</SelectItem>
                            <SelectItem value="ดีเซล">ดีเซล</SelectItem>
                            <SelectItem value="ไฮบริด">ไฮบริด</SelectItem>
                            <SelectItem value="EV">EV</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transmission">เกียร์</Label>
                        <Select name="transmission" defaultValue={editingCar?.transmission ?? ""}>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือก" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ธรรมดา">ธรรมดา</SelectItem>
                            <SelectItem value="อัตโนมัติ">อัตโนมัติ</SelectItem>
                            <SelectItem value="CVT">CVT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="plateNumber">ทะเบียน</Label>
                        <Input id="plateNumber" name="plateNumber" defaultValue={editingCar?.plateNumber ?? ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vin">เลขตัวถัง</Label>
                        <Input id="vin" name="vin" defaultValue={editingCar?.vin ?? ""} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="costPrice">ราคาทุน (บาท) *</Label>
                        <Input id="costPrice" name="costPrice" type="number" required defaultValue={editingCar?.costPrice} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sellingPrice">ราคาขาย (บาท) *</Label>
                        <Input id="sellingPrice" name="sellingPrice" type="number" required defaultValue={editingCar?.sellingPrice} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="condition">สภาพรถ</Label>
                        <Select name="condition" defaultValue={editingCar?.condition ?? ""}>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือก" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ดีเยี่ยม">ดีเยี่ยม</SelectItem>
                            <SelectItem value="ดี">ดี</SelectItem>
                            <SelectItem value="พอใช้">พอใช้</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">สถานะ</Label>
                        <Select name="status" defaultValue={editingCar?.status ?? "AVAILABLE"}>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือก" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AVAILABLE">พร้อมขาย</SelectItem>
                            <SelectItem value="RESERVED">จองแล้ว</SelectItem>
                            <SelectItem value="SOLD">ขายแล้ว</SelectItem>
                            <SelectItem value="MAINTENANCE">ซ่อมบำรุง</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">รายละเอียดเพิ่มเติม</Label>
                      <Textarea id="description" name="description" rows={3} defaultValue={editingCar?.description ?? ""} />
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        รูปภาพรถยนต์
                      </Label>
                      <ImageUploader
                        images={carImages}
                        onChange={setCarImages}
                        maxImages={5}
                      />
                    </div>

                    <DialogFooter>
                      <Button type="submit">
                        {editingCar ? "อัปเดต" : "เพิ่มรถยนต์"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-320px)]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>รถยนต์</TableHead>
                        <TableHead>ปี</TableHead>
                        <TableHead>เลขไมล์</TableHead>
                        <TableHead>ราคาทุน</TableHead>
                        <TableHead>ราคาขาย</TableHead>
                        <TableHead>สถานะ</TableHead>
                        <TableHead className="text-right">การจัดการ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cars.length > 0 ? (
                        cars.map((car) => (
                          <TableRow key={car.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{car.brand} {car.model}</p>
                                <p className="text-sm text-muted-foreground">
                                  {car.color} • {car.plateNumber || "-"}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>{car.year}</TableCell>
                            <TableCell>{car.mileage.toLocaleString()} km</TableCell>
                            <TableCell>{formatCurrency(car.costPrice)}</TableCell>
                            <TableCell className="font-bold">{formatCurrency(car.sellingPrice)}</TableCell>
                            <TableCell>
                              <Badge variant={statusConfig[car.status].variant}>
                                {statusConfig[car.status].label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {car.status === "AVAILABLE" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedCarForSale(car);
                                      setSaleDialogOpen(true);
                                    }}
                                  >
                                    <DollarSign className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingCar(car);
                                    try {
                                      const existingImages = car.images ? JSON.parse(car.images) : [];
                                      setCarImages(existingImages);
                                    } catch {
                                      setCarImages([]);
                                    }
                                    setCarDialogOpen(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive"
                                  onClick={() => handleDeleteCar(car.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            ไม่พบรถยนต์
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาลูกค้า..."
                  value={searchCustomer}
                  onChange={(e) => setSearchCustomer(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Dialog open={customerDialogOpen} onOpenChange={(open) => {
                setCustomerDialogOpen(open);
                if (!open) setEditingCustomer(null);
              }}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    เพิ่มลูกค้า
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingCustomer ? "แก้ไขลูกค้า" : "เพิ่มลูกค้าใหม่"}</DialogTitle>
                    <DialogDescription>
                      กรอกข้อมูลลูกค้าให้ครบถ้วน
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCustomerSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">ชื่อ-นามสกุล *</Label>
                      <Input id="name" name="name" required defaultValue={editingCustomer?.name} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">เบอร์โทรศัพท์ *</Label>
                      <Input id="phone" name="phone" required defaultValue={editingCustomer?.phone} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">อีเมล</Label>
                      <Input id="email" name="email" type="email" defaultValue={editingCustomer?.email ?? ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">ที่อยู่</Label>
                      <Textarea id="address" name="address" rows={2} defaultValue={editingCustomer?.address ?? ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="idCard">เลขบัตรประชาชน</Label>
                      <Input id="idCard" name="idCard" defaultValue={editingCustomer?.idCard ?? ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="note">หมายเหตุ</Label>
                      <Textarea id="note" name="note" rows={2} defaultValue={editingCustomer?.note ?? ""} />
                    </div>
                    <DialogFooter>
                      <Button type="submit">
                        {editingCustomer ? "อัปเดต" : "เพิ่มลูกค้า"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-320px)]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ชื่อ</TableHead>
                        <TableHead>เบอร์โทร</TableHead>
                        <TableHead>อีเมล</TableHead>
                        <TableHead>ที่อยู่</TableHead>
                        <TableHead className="text-right">การจัดการ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.length > 0 ? (
                        customers.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell className="font-medium">{customer.name}</TableCell>
                            <TableCell>{customer.phone}</TableCell>
                            <TableCell>{customer.email || "-"}</TableCell>
                            <TableCell>{customer.address || "-"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedCustomerForContact(customer);
                                    setContactDialogOpen(true);
                                  }}
                                >
                                  <Phone className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingCustomer(customer);
                                    setCustomerDialogOpen(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive"
                                  onClick={() => handleDeleteCustomer(customer.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            ไม่พบลูกค้า
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ประวัติการขาย</CardTitle>
                <CardDescription>รายการขายรถยนต์ทั้งหมด</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-280px)]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>วันที่</TableHead>
                        <TableHead>รถยนต์</TableHead>
                        <TableHead>ลูกค้า</TableHead>
                        <TableHead>ราคาขาย</TableHead>
                        <TableHead>กำไร</TableHead>
                        <TableHead>ประเภทชำระ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales.length > 0 ? (
                        sales.map((sale) => (
                          <TableRow key={sale.id}>
                            <TableCell>{formatDate(sale.saleDate)}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{sale.car.brand} {sale.car.model}</p>
                                <p className="text-sm text-muted-foreground">{sale.car.year}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{sale.customer.name}</p>
                                <p className="text-sm text-muted-foreground">{sale.customer.phone}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-bold">{formatCurrency(sale.salePrice)}</TableCell>
                            <TableCell className="text-green-600 font-bold">{formatCurrency(sale.profit)}</TableCell>
                            <TableCell>{sale.paymentType || "เงินสด"}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            ยังไม่มีประวัติการขาย
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Sale Dialog */}
      <Dialog open={saleDialogOpen} onOpenChange={setSaleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>บันทึกการขาย</DialogTitle>
            <DialogDescription>
              {selectedCarForSale && (
                <span>
                  {selectedCarForSale.brand} {selectedCarForSale.model} ({selectedCarForSale.year})
                  {" - "}
                  <span className="font-bold text-primary">{formatCurrency(selectedCarForSale.sellingPrice)}</span>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerId">เลือกลูกค้า *</Label>
              <Select name="customerId" required>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกลูกค้า" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} ({customer.phone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="salePrice">ราคาขายจริง (บาท) *</Label>
              <Input 
                id="salePrice" 
                name="salePrice" 
                type="number" 
                required 
                defaultValue={selectedCarForSale?.sellingPrice}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentType">ประเภทการชำระ</Label>
              <Select name="paymentType" defaultValue="เงินสด">
                <SelectTrigger>
                  <SelectValue placeholder="เลือก" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="เงินสด">เงินสด</SelectItem>
                  <SelectItem value="ไฟแนนซ์">ไฟแนนซ์</SelectItem>
                  <SelectItem value="ผ่อนชำระ">ผ่อนชำระ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">หมายเหตุ</Label>
              <Textarea id="note" name="note" rows={2} />
            </div>
            <DialogFooter>
              <Button type="submit">บันทึกการขาย</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>บันทึกการติดต่อ</DialogTitle>
            <DialogDescription>
              {selectedCustomerForContact && (
                <span>ลูกค้า: {selectedCustomerForContact.name}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contactType">ประเภทการติดต่อ *</Label>
              <Select name="contactType" required>
                <SelectTrigger>
                  <SelectValue placeholder="เลือก" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="โทรศัพท์">โทรศัพท์</SelectItem>
                  <SelectItem value="Line">Line</SelectItem>
                  <SelectItem value="มาหน้าร้าน">มาหน้าร้าน</SelectItem>
                  <SelectItem value="อื่นๆ">อื่นๆ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">รายละเอียด *</Label>
              <Textarea id="note" name="note" rows={3} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="followUpDate">นัดติดตามครั้งถัดไป</Label>
              <Input id="followUpDate" name="followUpDate" type="date" />
            </div>
            <DialogFooter>
              <Button type="submit">บันทึก</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}