"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { 
  Car, Search, Phone, Mail, MapPin, Calendar, Gauge, Fuel, Settings,
  ShoppingCart, CheckCircle2, Shield, Award, Heart, MessageCircle, User, Menu, X, Sparkles, ArrowRight
} from "lucide-react";
import { toast } from "sonner";

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
  status: string;
  condition?: string | null;
  purchaseDate?: string | null;
  createdAt: string;
}

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Format number with commas
const formatNumber = (num: number) => {
  return new Intl.NumberFormat("th-TH").format(num);
};

// Car brand emojis
const brandEmojis: Record<string, string> = {
  Toyota: "🚙",
  Honda: "🚗",
  Mazda: "🚘",
  Nissan: "🚙",
  Mitsubishi: "🚗",
  Ford: "🚙",
  Isuzu: "🚐",
  BMW: "🚗",
  Mercedes: "🚗",
};

// Image gallery state hook
function useImageGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const next = (total: number) => setCurrentIndex((prev) => (prev + 1) % total);
  const prev = (total: number) => setCurrentIndex((prev) => (prev - 1 + total) % total);
  const reset = () => setCurrentIndex(0);
  return { currentIndex, next, prev, reset, setCurrentIndex };
}

export default function CustomerShowroom() {
  const [cars, setCars] = useState<CarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedFuel, setSelectedFuel] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  
  // Dialogs
  const [selectedCar, setSelectedCar] = useState<CarData | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [reserveDialogOpen, setReserveDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const gallery = useImageGallery();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Form
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  // Fetch cars
  const fetchCars = useCallback(async () => {
    try {
      const res = await fetch(`/api/cars?status=AVAILABLE`);
      if (!res.ok) throw new Error("Failed to fetch cars");
      const data = await res.json();
      setCars(data);
    } catch (error) {
      console.error("Error fetching cars:", error);
      toast.error("โหลดข้อมูลรถยนต์ล้มเหลว");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  // Get unique brands
  const brands = [...new Set(cars.map(car => car.brand))];

  // Filter cars
  const filteredCars = cars.filter(car => {
    const matchesSearch = 
      car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.color.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBrand = selectedBrand === "all" || car.brand === selectedBrand;
    const matchesFuel = selectedFuel === "all" || car.fuelType === selectedFuel;
    
    let matchesPrice = true;
    if (priceRange !== "all") {
      const price = car.sellingPrice;
      switch (priceRange) {
        case "under1m":
          matchesPrice = price < 1000000;
          break;
        case "1m-1.5m":
          matchesPrice = price >= 1000000 && price < 1500000;
          break;
        case "1.5m-2m":
          matchesPrice = price >= 1500000 && price < 2000000;
          break;
        case "over2m":
          matchesPrice = price >= 2000000;
          break;
      }
    }
    
    return matchesSearch && matchesBrand && matchesFuel && matchesPrice;
  });

  // Handle reserve
  const handleReserve = async () => {
    if (!selectedCar) return;
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error("กรุณากรอกชื่อและเบอร์โทรศัพท์");
      return;
    }

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId: selectedCar.id,
          ...formData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create reservation");
      }

      setReserveDialogOpen(false);
      setSuccessDialogOpen(true);
      fetchCars();
      setFormData({ name: "", phone: "", email: "", message: "" });
    } catch (error) {
      console.error("Error creating reservation:", error);
      toast.error(error instanceof Error ? error.message : "จองรถล้มเหลว");
    }
  };

  // Open reserve dialog
  const openReserveDialog = (car: CarData) => {
    setSelectedCar(car);
    setReserveDialogOpen(true);
  };

  // Open detail dialog
  const openDetailDialog = (car: CarData) => {
    setSelectedCar(car);
    gallery.reset();
    setDetailDialogOpen(true);
  };

  // แปลง images string เป็น array
const getCarImages = (images: string | null | undefined): string[] => {
  if (!images) return [];
  try {
    return JSON.parse(images);
  } catch {
    return [];
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-lg">กำลังโหลดรถยนต์...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-primary">รถมือสองคุณภาพ</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Quality Second-Hand Cars</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <a href="#cars" className="text-sm font-medium hover:text-primary transition-colors">รถยนต์ทั้งหมด</a>
              <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">เกี่ยวกับเรา</a>
              <a href="#contact" className="text-sm font-medium hover:text-primary transition-colors">ติดต่อเรา</a>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                  <User className="w-4 h-4" />
                  Admin
                </Button>
              </Link>
              <a href="tel:081-234-5678">
                <Button size="sm" className="gap-2">
                  <Phone className="w-4 h-4" />
                  <span className="hidden sm:inline">โทรเลย</span>
                </Button>
              </a>
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col gap-3">
                <a href="#cars" className="text-sm font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>รถยนต์ทั้งหมด</a>
                <a href="#about" className="text-sm font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>เกี่ยวกับเรา</a>
                <a href="#contact" className="text-sm font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>ติดต่อเรา</a>
                <Link href="/login" className="text-sm font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              รถคุณภาพ ราคายุติธรรม
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight">
              ค้นหารถมือสอง
              <span className="text-primary block">ที่ใช่สำหรับคุณ</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              เลือกซื้อรถยนต์มือสองคุณภาพดี สภาพเหมือนใหม่ พร้อมรับประกัน
            </p>
            
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-2xl font-bold text-primary">{cars.length}</p>
                <p className="text-xs text-muted-foreground">คันพร้อมขาย</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-2xl font-bold text-primary">10+</p>
                <p className="text-xs text-muted-foreground">ปีประสบการณ์</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-2xl font-bold text-primary">500+</p>
                <p className="text-xs text-muted-foreground">ลูกค้าไว้วางใจ</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section id="cars" className="py-6 bg-white border-y">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="ค้นหารถยนต์..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-11" />
            </div>
            
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="w-full sm:w-[150px] h-11"><SelectValue placeholder="ยี่ห้อ" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกยี่ห้อ</SelectItem>
                {brands.map(brand => (<SelectItem key={brand} value={brand}>{brand}</SelectItem>))}
              </SelectContent>
            </Select>

            <Select value={selectedFuel} onValueChange={setSelectedFuel}>
              <SelectTrigger className="w-full sm:w-[150px] h-11"><SelectValue placeholder="เชื้อเพลิง" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกประเภท</SelectItem>
                <SelectItem value="เบนซิน">เบนซิน</SelectItem>
                <SelectItem value="ดีเซล">ดีเซล</SelectItem>
                <SelectItem value="ไฮบริด">ไฮบริด</SelectItem>
                <SelectItem value="EV">EV</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-full sm:w-[180px] h-11"><SelectValue placeholder="ราคา" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกราคา</SelectItem>
                <SelectItem value="under1m">ต่ำกว่า 1 ล้าน</SelectItem>
                <SelectItem value="1m-1.5m">1 - 1.5 ล้าน</SelectItem>
                <SelectItem value="1.5m-2m">1.5 - 2 ล้าน</SelectItem>
                <SelectItem value="over2m">มากกว่า 2 ล้าน</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Cars Grid */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">รถยนต์พร้อมขาย</h2>
              <p className="text-muted-foreground">พบ {filteredCars.length} คัน</p>
            </div>
          </div>

          {filteredCars.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCars.map((car) => (
                <Card key={car.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md">
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                    {getCarImages(car.images).length > 0 ? (
                      <img
                        src={getCarImages(car.images)[0]}
                        alt={`${car.brand} ${car.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl opacity-50">{brandEmojis[car.brand] || "🚗"}</span>
                      </div>
                    )}
                    {getCarImages(car.images).length > 1 && (
                      <div className="absolute bottom-3 right-3">
                        <Badge variant="secondary" className="bg-black/60 text-white border-0">
                          📷 {getCarImages(car.images).length} รูป
                        </Badge>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge className="bg-green-500 hover:bg-green-600">พร้อมขาย</Badge>
                      {car.fuelType === "ไฮบริด" && (<Badge variant="secondary" className="bg-emerald-500 text-white hover:bg-emerald-600">ไฮบริด</Badge>)}
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <Button size="sm" variant="secondary" onClick={() => openDetailDialog(car)}>ดูรายละเอียด</Button>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-bold text-lg">{car.brand} {car.model}</p>
                        <p className="text-sm text-muted-foreground">{car.year} • {car.color}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1"><Gauge className="w-4 h-4" />{formatNumber(car.mileage)} km</div>
                      <div className="flex items-center gap-1"><Fuel className="w-4 h-4" />{car.fuelType || "-"}</div>
                      <div className="flex items-center gap-1"><Settings className="w-4 h-4" />{car.transmission || "-"}</div>
                      <div className="flex items-center gap-1"><Shield className="w-4 h-4" />{car.condition || "-"}</div>
                    </div>

                    <Separator className="my-3" />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">ราคา</p>
                        <p className="text-xl font-bold text-primary">{formatCurrency(car.sellingPrice)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openDetailDialog(car)}>รายละเอียด</Button>
                        <Button size="sm" onClick={() => openReserveDialog(car)}>จอง</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Car className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">ไม่พบรถยนต์</h3>
              <p className="text-muted-foreground">ลองเปลี่ยนตัวกรองหรือค้นหาใหม่</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="about" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">ทำไมต้องเลือกเรา?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">เรามุ่งมั่นให้บริการรถมือสองคุณภาพดี พร้อมบริการหลังการขายที่เป็นเลิศ</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
              <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-7 h-7 text-white" /></div>
              <h3 className="font-bold mb-2">รับประกันคุณภาพ</h3>
              <p className="text-sm text-muted-foreground">รถทุกคันผ่านการตรวจสอบ 150 จุด</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
              <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4"><Shield className="w-7 h-7 text-white" /></div>
              <h3 className="font-bold mb-2">ไม่ใช่รถอุบ</h3>
              <p className="text-sm text-muted-foreground">รับประกันไม่ใช่รถอุบหนัก</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100">
              <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4"><Award className="w-7 h-7 text-white" /></div>
              <h3 className="font-bold mb-2">บริการหลังการขาย</h3>
              <p className="text-sm text-muted-foreground">ดูแลหลังขาย 1 ปี</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100">
              <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4"><Heart className="w-7 h-7 text-white" /></div>
              <h3 className="font-bold mb-2">ราคายุติธรรม</h3>
              <p className="text-sm text-muted-foreground">ราคาตรงไปตรงมา</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gradient-to-br from-primary to-primary/90 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">พร้อมที่จะได้รถในฝัน?</h2>
            <p className="text-white/80 mb-8">ติดต่อเราวันนี้ เพื่อรับข้อเสนอพิเศษ!</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="tel:081-234-5678" className="w-full sm:w-auto"><Button size="lg" variant="secondary" className="w-full gap-2"><Phone className="w-5 h-5" />โทร 081-234-5678</Button></a>
              <a href="https://line.me" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto"><Button size="lg" variant="outline" className="w-full gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"><MessageCircle className="w-5 h-5" />Line: @cardealer</Button></a>
            </div>
            <div className="mt-12 grid sm:grid-cols-3 gap-6 text-left">
              <div><div className="flex items-center gap-2 mb-2"><Phone className="w-5 h-5" /><span className="font-semibold">โทรศัพท์</span></div><p className="text-white/70">081-234-5678</p></div>
              <div><div className="flex items-center gap-2 mb-2"><Mail className="w-5 h-5" /><span className="font-semibold">อีเมล</span></div><p className="text-white/70">info@cardealer.co.th</p></div>
              <div><div className="flex items-center gap-2 mb-2"><MapPin className="w-5 h-5" /><span className="font-semibold">ที่อยู่</span></div><p className="text-white/70">123 ถ.สุขุมวิท กรุงเทพฯ</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"><Car className="w-5 h-5" /></div>
              <span className="font-bold">รถมือสองคุณภาพ</span>
            </div>
            <p className="text-sm text-slate-400">© 2025 Car Dealer. All rights reserved.</p>
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Admin Panel</Link>
          </div>
        </div>
      </footer>

      {/* Car Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedCar && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedCar.brand} {selectedCar.model}</DialogTitle>
                <DialogDescription>{selectedCar.year} • {selectedCar.color} • {selectedCar.plateNumber || "ทะเบียนใหม่"}</DialogDescription>
              </DialogHeader>

              {(() => {
                const imgs = getCarImages(selectedCar.images);
                if (imgs.length > 0) {
                  return (
                    <div className="space-y-3">
                      {/* Main Image */}
                      <div className="relative aspect-video bg-slate-100 rounded-xl overflow-hidden">
                        <img
                          src={imgs[gallery.currentIndex]}
                          alt={`${selectedCar.brand} ${selectedCar.model} - รูปที่ ${gallery.currentIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {imgs.length > 1 && (
                          <>
                            <button
                              onClick={() => gallery.prev(imgs.length)}
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                            >
                              ‹
                            </button>
                            <button
                              onClick={() => gallery.next(imgs.length)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                            >
                              ›
                            </button>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                              {gallery.currentIndex + 1} / {imgs.length}
                            </div>
                          </>
                        )}
                      </div>
                      {/* Thumbnails */}
                      {imgs.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {imgs.map((url, idx) => (
                            <button
                              key={idx}
                              onClick={() => gallery.setCurrentIndex(idx)}
                              className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                                idx === gallery.currentIndex ? "border-primary" : "border-transparent hover:border-muted-foreground/30"
                              }`}
                            >
                              <img src={url} alt={`รูปที่ ${idx + 1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                    <span className="text-8xl opacity-50">{brandEmojis[selectedCar.brand] || "🚗"}</span>
                  </div>
                );
              })()}

              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl">
                <div>
                  <p className="text-sm text-muted-foreground">ราคาพิเศษ</p>
                  <p className="text-3xl font-bold text-primary">{formatCurrency(selectedCar.sellingPrice)}</p>
                </div>
                <Button size="lg" onClick={() => { setDetailDialogOpen(false); openReserveDialog(selectedCar); }}>จองรถคันนี้<ArrowRight className="w-4 h-4 ml-2" /></Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg text-center"><Gauge className="w-5 h-5 mx-auto mb-1 text-muted-foreground" /><p className="text-sm font-medium">{formatNumber(selectedCar.mileage)} km</p><p className="text-xs text-muted-foreground">เลขไมล์</p></div>
                <div className="p-3 bg-muted/50 rounded-lg text-center"><Fuel className="w-5 h-5 mx-auto mb-1 text-muted-foreground" /><p className="text-sm font-medium">{selectedCar.fuelType || "-"}</p><p className="text-xs text-muted-foreground">เชื้อเพลิง</p></div>
                <div className="p-3 bg-muted/50 rounded-lg text-center"><Settings className="w-5 h-5 mx-auto mb-1 text-muted-foreground" /><p className="text-sm font-medium">{selectedCar.transmission || "-"}</p><p className="text-xs text-muted-foreground">เกียร์</p></div>
                <div className="p-3 bg-muted/50 rounded-lg text-center"><Calendar className="w-5 h-5 mx-auto mb-1 text-muted-foreground" /><p className="text-sm font-medium">{selectedCar.year}</p><p className="text-xs text-muted-foreground">ปีรถ</p></div>
              </div>

              <div><h4 className="font-semibold mb-2">รายละเอียด</h4><p className="text-muted-foreground">{selectedCar.description || "ไม่มีรายละเอียดเพิ่มเติม"}</p></div>

              <div><h4 className="font-semibold mb-3">คุณสมบัติ</h4><div className="grid grid-cols-2 gap-2"><div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-500" />เครื่องยนต์ {selectedCar.engineSize ? `${selectedCar.engineSize} cc` : "-"}</div><div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-500" />สภาพ {selectedCar.condition || "ดี"}</div><div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-500" />ออกหนังสือรับรองได้</div><div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-500" />เปลี่ยนมือได้ทุกจังหวัด</div></div></div>

              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>ปิด</Button>
                <Button onClick={() => { setDetailDialogOpen(false); openReserveDialog(selectedCar); }}>จองรถคันนี้</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reserve Dialog */}
      <Dialog open={reserveDialogOpen} onOpenChange={setReserveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>จองรถยนต์</DialogTitle>
            <DialogDescription>
              {selectedCar && (<span>{selectedCar.brand} {selectedCar.model} ({selectedCar.year}) - <span className="font-bold text-primary ml-1">{formatCurrency(selectedCar.sellingPrice)}</span></span>)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2"><Label htmlFor="name">ชื่อ-นามสกุล *</Label><Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="กรอกชื่อ-นามสกุล" /></div>
            <div className="space-y-2"><Label htmlFor="phone">เบอร์โทรศัพท์ *</Label><Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="0xx-xxx-xxxx" /></div>
            <div className="space-y-2"><Label htmlFor="email">อีเมล</Label><Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com" /></div>
            <div className="space-y-2"><Label htmlFor="message">ข้อความเพิ่มเติม</Label><Textarea id="message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="เช่น ต้องการทดลองขับ..." rows={3} /></div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setReserveDialogOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleReserve}>ยืนยันการจอง</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="text-center">
          <div className="py-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-10 h-10 text-green-500" /></div>
            <h2 className="text-2xl font-bold mb-2">จองรถสำเร็จ!</h2>
            <p className="text-muted-foreground mb-6">ขอบคุณที่สนใจรถยนต์ของเรา เราจะติดต่อกลับไปเร็วที่สุดภายใน 24 ชั่วโมง</p>
            <div className="p-4 bg-muted/50 rounded-xl text-left mb-6"><p className="text-sm text-muted-foreground">หากต้องการติดต่อด่วน</p><a href="tel:081-234-5678" className="flex items-center gap-2 text-primary font-medium mt-1"><Phone className="w-4 h-4" />โทร 081-234-5678</a></div>
            <Button onClick={() => setSuccessDialogOpen(false)}>ปิด</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}