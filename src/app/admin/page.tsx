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
  Phone, Mail, MapPin, BarChart3, ShoppingCart, ArrowLeft, Home, Settings
} from "lucide-react";
import { toast } from "sonner";

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
  status: string;
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
  latestSales: SaleData[];
  latestCars: CarData[];
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  AVAILABLE: { label: "พร้อมขาย", variant: "default" },
  RESERVED: { label: "จองแล้ว", variant: "secondary" },
  SOLD: { label: "ขายแล้ว", variant: "outline" },
  MAINTENANCE: { label: "ซ่อมบำรุง", variant: "destructive" },
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [cars, setCars] = useState<CarData[]>([]);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [sales, setSales] = useState<SaleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCar, setSearchCar] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [carDialogOpen, setCarDialogOpen] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<CarData | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<CustomerData | null>(null);
  const [selectedCarForSale, setSelectedCarForSale] = useState<CarData | null>(null);
  const [selectedCustomerForContact, setSelectedCustomerForContact] = useState<CustomerData | null>(null);

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
    };

    try {
      const url = editingCar ? `/api/cars/${editingCar.id}` : "/api/cars";
      const method = editingCar ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(carData) });
      if (!res.ok) throw new Error("Failed to save car");
      toast.success(editingCar ? "อัปเดตรถยนต์สำเร็จ" : "เพิ่มรถยนต์สำเร็จ");
      setCarDialogOpen(false);
      setEditingCar(null);
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
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(customerData) });
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
      const res = await fetch("/api/sales", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(saleData) });
      if (!res.ok) { const error = await res.json(); throw new Error(error.error || "Failed to create sale"); }
      toast.success("บันทึกการขายสำเร็จ");
      setSaleDialogOpen(false);
      setSelectedCarForSale(null);
      fetchAllData();
    } catch (error) {
      console.error("Error creating sale:", error);
      toast.error(error instanceof Error ? error.message : "บันทึกการขายล้มเหลว");
    }
  };

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
      const res = await fetch("/api/contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(contactData) });
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
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">กลับหน้าร้าน</span>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="p-2 bg-primary/10 rounded-lg"><Settings className="w-5 h-5 text-primary" /></div>
              <div><h1 className="text-lg font-bold">Admin Dashboard</h1><p className="text-xs text-muted-foreground">ระบบจัดการรถมือสอง</p></div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/"><Button variant="outline" size="sm" className="gap-2"><Home className="w-4 h-4" />หน้าร้าน</Button></Link>
              <Badge variant="outline" className="gap-1">Admin</Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="gap-2"><BarChart3 className="w-4 h-4" /><span className="hidden sm:inline">Dashboard</span></TabsTrigger>
            <TabsTrigger value="cars" className="gap-2"><Car className="w-4 h-4" /><span className="hidden sm:inline">รถยนต์</span></TabsTrigger>
            <TabsTrigger value="customers" className="gap-2"><Users className="w-4 h-4" /><span className="hidden sm:inline">ลูกค้า</span></TabsTrigger>
            <TabsTrigger value="sales" className="gap-2"><ShoppingCart className="w-4 h-4" /><span className="hidden sm:inline">การขาย</span></TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">รถในสต็อก</CardTitle><Car className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{dashboard?.summary.totalCars || 0}</div><p className="text-xs text-muted-foreground">พร้อมขาย {dashboard?.summary.availableCars || 0} คัน</p></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">ลูกค้าทั้งหมด</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{dashboard?.summary.totalCustomers || 0}</div><p className="text-xs text-muted-foreground">รายชื่อลูกค้าในระบบ</p></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">ยอดขายรวม</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(dashboard?.summary.totalSales || 0)}</div><p className="text-xs text-muted-foreground">{dashboard?.summary.salesCount || 0} รายการ</p></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">กำไรรวม</CardTitle><TrendingUp className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(dashboard?.summary.totalProfit || 0)}</div><p className="text-xs text-muted-foreground">จากการขายรถ</p></CardContent></Card>
            </div>
            <Card><CardHeader><CardTitle>มูลค่าสินค้าคงเหลือ</CardTitle></CardHeader><CardContent><div className="grid gap-4 sm:grid-cols-2"><div className="p-4 rounded-lg bg-muted/50"><p className="text-sm text-muted-foreground">มูลค่าตามราคาทุน</p><p className="text-2xl font-bold">{formatCurrency(dashboard?.summary.inventoryCostValue || 0)}</p></div><div className="p-4 rounded-lg bg-muted/50"><p className="text-sm text-muted-foreground">มูลค่าตามราคาขาย</p><p className="text-2xl font-bold text-green-600">{formatCurrency(dashboard?.summary.inventorySellingValue || 0)}</p></div></div></CardContent></Card>
          </TabsContent>

          <TabsContent value="cars" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="ค้นหารถยนต์..." value={searchCar} onChange={(e) => setSearchCar(e.target.value)} className="pl-9" /></div>
              <Dialog open={carDialogOpen} onOpenChange={(open) => { setCarDialogOpen(open); if (!open) setEditingCar(null); }}>
                <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" />เพิ่มรถยนต์</Button></DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>{editingCar ? "แก้ไขรถยนต์" : "เพิ่มรถยนต์ใหม่"}</DialogTitle></DialogHeader>
                  <form onSubmit={handleCarSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>ยี่ห้อ *</Label><Input name="brand" required defaultValue={editingCar?.brand} /></div><div className="space-y-2"><Label>รุ่น *</Label><Input name="model" required defaultValue={editingCar?.model} /></div></div>
                    <div className="grid grid-cols-3 gap-4"><div className="space-y-2"><Label>ปี *</Label><Input name="year" type="number" required defaultValue={editingCar?.year} /></div><div className="space-y-2"><Label>สี *</Label><Input name="color" required defaultValue={editingCar?.color} /></div><div className="space-y-2"><Label>เลขไมล์ (km) *</Label><Input name="mileage" type="number" required defaultValue={editingCar?.mileage} /></div></div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2"><Label>ขนาดเครื่องยนต์ (cc)</Label><Input name="engineSize" type="number" step="0.1" defaultValue={editingCar?.engineSize ?? ""} /></div>
                      <div className="space-y-2"><Label>ประเภทเชื้อเพลิง</Label><Select name="fuelType" defaultValue={editingCar?.fuelType ?? ""}><SelectTrigger><SelectValue placeholder="เลือก" /></SelectTrigger><SelectContent><SelectItem value="เบนซิน">เบนซิน</SelectItem><SelectItem value="ดีเซล">ดีเซล</SelectItem><SelectItem value="ไฮบริด">ไฮบริด</SelectItem><SelectItem value="EV">EV</SelectItem></SelectContent></Select></div>
                      <div className="space-y-2"><Label>เกียร์</Label><Select name="transmission" defaultValue={editingCar?.transmission ?? ""}><SelectTrigger><SelectValue placeholder="เลือก" /></SelectTrigger><SelectContent><SelectItem value="ธรรมดา">ธรรมดา</SelectItem><SelectItem value="อัตโนมัติ">อัตโนมัติ</SelectItem><SelectItem value="CVT">CVT</SelectItem></SelectContent></Select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>ทะเบียน</Label><Input name="plateNumber" defaultValue={editingCar?.plateNumber ?? ""} /></div><div className="space-y-2"><Label>เลขตัวถัง</Label><Input name="vin" defaultValue={editingCar?.vin ?? ""} /></div></div>
                    <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>ราคาทุน (บาท) *</Label><Input name="costPrice" type="number" required defaultValue={editingCar?.costPrice} /></div><div className="space-y-2"><Label>ราคาขาย (บาท) *</Label><Input name="sellingPrice" type="number" required defaultValue={editingCar?.sellingPrice} /></div></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>สภาพรถ</Label><Select name="condition" defaultValue={editingCar?.condition ?? ""}><SelectTrigger><SelectValue placeholder="เลือก" /></SelectTrigger><SelectContent><SelectItem value="ดีเยี่ยม">ดีเยี่ยม</SelectItem><SelectItem value="ดี">ดี</SelectItem><SelectItem value="พอใช้">พอใช้</SelectItem></SelectContent></Select></div>
                      <div className="space-y-2"><Label>สถานะ</Label><Select name="status" defaultValue={editingCar?.status ?? "AVAILABLE"}><SelectTrigger><SelectValue placeholder="เลือก" /></SelectTrigger><SelectContent><SelectItem value="AVAILABLE">พร้อมขาย</SelectItem><SelectItem value="RESERVED">จองแล้ว</SelectItem><SelectItem value="SOLD">ขายแล้ว</SelectItem><SelectItem value="MAINTENANCE">ซ่อมบำรุง</SelectItem></SelectContent></Select></div>
                    </div>
                    <div className="space-y-2"><Label>รายละเอียดเพิ่มเติม</Label><Textarea name="description" rows={3} defaultValue={editingCar?.description ?? ""} /></div>
                    <DialogFooter><Button type="submit">{editingCar ? "อัปเดต" : "เพิ่มรถยนต์"}</Button></DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <Card><CardContent className="p-0"><ScrollArea className="h-[calc(100vh-320px)]"><Table><TableHeader><TableRow><TableHead>รถยนต์</TableHead><TableHead>ปี</TableHead><TableHead>เลขไมล์</TableHead><TableHead>ราคาทุน</TableHead><TableHead>ราคาขาย</TableHead><TableHead>สถานะ</TableHead><TableHead className="text-right">การจัดการ</TableHead></TableRow></TableHeader><TableBody>{cars.length > 0 ? cars.map((car) => (<TableRow key={car.id}><TableCell><div><p className="font-medium">{car.brand} {car.model}</p><p className="text-sm text-muted-foreground">{car.color} • {car.plateNumber || "-"}</p></div></TableCell><TableCell>{car.year}</TableCell><TableCell>{car.mileage.toLocaleString()} km</TableCell><TableCell>{formatCurrency(car.costPrice)}</TableCell><TableCell className="font-bold">{formatCurrency(car.sellingPrice)}</TableCell><TableCell><Badge variant={statusConfig[car.status]?.variant || "default"}>{statusConfig[car.status]?.label || car.status}</Badge></TableCell><TableCell className="text-right"><div className="flex justify-end gap-2">{car.status === "AVAILABLE" && (<Button size="sm" variant="outline" onClick={() => { setSelectedCarForSale(car); setSaleDialogOpen(true); }}><DollarSign className="w-4 h-4" /></Button>)}<Button size="sm" variant="ghost" onClick={() => { setEditingCar(car); setCarDialogOpen(true); }}><Edit className="w-4 h-4" /></Button><Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteCar(car.id)}><Trash2 className="w-4 h-4" /></Button></div></TableCell></TableRow>)) : <TableRow><TableCell colSpan={7} className="h-24 text-center">ไม่พบรถยนต์</TableCell></TableRow>}</TableBody></Table></ScrollArea></CardContent></Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="ค้นหาลูกค้า..." value={searchCustomer} onChange={(e) => setSearchCustomer(e.target.value)} className="pl-9" /></div>
              <Dialog open={customerDialogOpen} onOpenChange={(open) => { setCustomerDialogOpen(open); if (!open) setEditingCustomer(null); }}>
                <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" />เพิ่มลูกค้า</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{editingCustomer ? "แก้ไขลูกค้า" : "เพิ่มลูกค้าใหม่"}</DialogTitle></DialogHeader>
                  <form onSubmit={handleCustomerSubmit} className="space-y-4">
                    <div className="space-y-2"><Label>ชื่อ-นามสกุล *</Label><Input name="name" required defaultValue={editingCustomer?.name} /></div>
                    <div className="space-y-2"><Label>เบอร์โทรศัพท์ *</Label><Input name="phone" required defaultValue={editingCustomer?.phone} /></div>
                    <div className="space-y-2"><Label>อีเมล</Label><Input name="email" type="email" defaultValue={editingCustomer?.email ?? ""} /></div>
                    <div className="space-y-2"><Label>ที่อยู่</Label><Textarea name="address" rows={2} defaultValue={editingCustomer?.address ?? ""} /></div>
                    <div className="space-y-2"><Label>เลขบัตรประชาชน</Label><Input name="idCard" defaultValue={editingCustomer?.idCard ?? ""} /></div>
                    <div className="space-y-2"><Label>หมายเหตุ</Label><Textarea name="note" rows={2} defaultValue={editingCustomer?.note ?? ""} /></div>
                    <DialogFooter><Button type="submit">{editingCustomer ? "อัปเดต" : "เพิ่มลูกค้า"}</Button></DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{customers.length > 0 ? customers.map((customer) => (<Card key={customer.id}><CardHeader className="pb-3"><div className="flex items-start justify-between"><div><CardTitle className="text-lg">{customer.name}</CardTitle><CardDescription className="flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{customer.phone}</CardDescription></div><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => { setEditingCustomer(customer); setCustomerDialogOpen(true); }}><Edit className="w-4 h-4" /></Button><Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteCustomer(customer.id)}><Trash2 className="w-4 h-4" /></Button></div></div></CardHeader><CardContent className="space-y-3">{customer.email && <p className="text-sm flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" />{customer.email}</p>}{customer.address && <p className="text-sm flex items-start gap-2"><MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />{customer.address}</p>}{customer.note && <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">{customer.note}</p>}<Separator /><div className="flex justify-between items-center"><p className="text-sm text-muted-foreground">ซื้อไปแล้ว {customer.sales?.length || 0} คัน</p><Button size="sm" variant="outline" onClick={() => { setSelectedCustomerForContact(customer); setContactDialogOpen(true); }}><Plus className="w-4 h-4 mr-1" />บันทึกติดต่อ</Button></div></CardContent></Card>)) : <div className="col-span-full text-center py-12 text-muted-foreground">ไม่พบลูกค้า</div>}</div>
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            <Card><CardHeader><CardTitle>ประวัติการขาย</CardTitle><CardDescription>รายการขายรถยนต์ทั้งหมด</CardDescription></CardHeader><CardContent className="p-0"><ScrollArea className="h-[calc(100vh-320px)]"><Table><TableHeader><TableRow><TableHead>วันที่ขาย</TableHead><TableHead>รถยนต์</TableHead><TableHead>ลูกค้า</TableHead><TableHead>ราคาขาย</TableHead><TableHead>กำไร</TableHead><TableHead>ประเภทชำระ</TableHead></TableRow></TableHeader><TableBody>{sales.length > 0 ? sales.map((sale) => (<TableRow key={sale.id}><TableCell>{formatDate(sale.saleDate)}</TableCell><TableCell><div><p className="font-medium">{sale.car.brand} {sale.car.model}</p><p className="text-sm text-muted-foreground">{sale.car.year}</p></div></TableCell><TableCell><div><p className="font-medium">{sale.customer.name}</p><p className="text-sm text-muted-foreground">{sale.customer.phone}</p></div></TableCell><TableCell className="font-bold">{formatCurrency(sale.salePrice)}</TableCell><TableCell><span className={sale.profit >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{formatCurrency(sale.profit)}</span></TableCell><TableCell><Badge variant="outline">{sale.paymentType || "เงินสด"}</Badge></TableCell></TableRow>)) : <TableRow><TableCell colSpan={6} className="h-24 text-center">ยังไม่มีการขาย</TableCell></TableRow>}</TableBody></Table></ScrollArea></CardContent></Card>
            <div className="grid gap-4 md:grid-cols-3">
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">ยอดขายรวม</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(dashboard?.summary.totalSales || 0)}</p></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">กำไรรวม</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-600">{formatCurrency(dashboard?.summary.totalProfit || 0)}</p></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">จำนวนรายการ</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{dashboard?.summary.salesCount || 0}</p></CardContent></Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Sale Dialog */}
      <Dialog open={saleDialogOpen} onOpenChange={setSaleDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>บันทึกการขาย</DialogTitle><DialogDescription>{selectedCarForSale && <span>{selectedCarForSale.brand} {selectedCarForSale.model} ({selectedCarForSale.year}) - ราคาขาย: {formatCurrency(selectedCarForSale.sellingPrice)}</span>}</DialogDescription></DialogHeader>
          <form onSubmit={handleSaleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>เลือกลูกค้า</Label><Select name="customerId" required><SelectTrigger><SelectValue placeholder="เลือกลูกค้า" /></SelectTrigger><SelectContent>{customers.map((customer) => (<SelectItem key={customer.id} value={customer.id}>{customer.name} ({customer.phone})</SelectItem>))}</SelectContent></Select></div>
            <div className="space-y-2"><Label>ราคาขายจริง (บาท)</Label><Input name="salePrice" type="number" required defaultValue={selectedCarForSale?.sellingPrice} /></div>
            <div className="space-y-2"><Label>ประเภทการชำระ</Label><Select name="paymentType" defaultValue="เงินสด"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="เงินสด">เงินสด</SelectItem><SelectItem value="ผ่อน">ผ่อน</SelectItem><SelectItem value="โอนเงิน">โอนเงิน</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>หมายเหตุ</Label><Textarea name="note" rows={2} /></div>
            <DialogFooter><Button type="submit">บันทึกการขาย</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>บันทึกการติดต่อ</DialogTitle><DialogDescription>{selectedCustomerForContact?.name}</DialogDescription></DialogHeader>
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="space-y-2"><Label>ประเภทการติดต่อ</Label><Select name="contactType" required><SelectTrigger><SelectValue placeholder="เลือก" /></SelectTrigger><SelectContent><SelectItem value="โทรศัพท์">โทรศัพท์</SelectItem><SelectItem value="Line">Line</SelectItem><SelectItem value="มาหน้าร้าน">มาหน้าร้าน</SelectItem><SelectItem value="อื่นๆ">อื่นๆ</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>รายละเอียด</Label><Textarea name="note" rows={3} required /></div>
            <div className="space-y-2"><Label>นัดติดตามครั้งถัดไป</Label><Input name="followUpDate" type="date" /></div>
            <DialogFooter><Button type="submit">บันทึก</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">© 2025 ระบบจัดการรถมือสอง - Admin Dashboard</p>
            <Link href="/" className="text-sm text-primary hover:underline">กลับหน้าร้าน</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}