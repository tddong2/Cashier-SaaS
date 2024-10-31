import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import bcrypt from 'bcryptjs'

type Product = {
  id: number
  name: string
  price: number
  category: 'grocery' | 'fastfood' | 'bundle'
  stock: number
  bundleItems?: { productId: number; quantity: number }[]
  image?: string
}

type OrderItem = {
  product: Product
  quantity: number
}

type Role = 'cashier' | 'admin' | 'manager' | 'owner'

type EmployeeStatus = 'active' | 'fired' | 'terminated' | 'eligible_for_rehire'

type Employee = {
  id: number
  username: string
  password: string
  role: Role
  status: EmployeeStatus
  clockedIn: boolean
  lastClockIn?: Date
  lastClockOut?: Date
  totalHours: number
  phoneNumber: string
  socialSecurity: string
  email: string
  address: string
}

type PaymentMethod = 'cash' | 'credit'

type Receipt = {
  id: number
  items: OrderItem[]
  subtotal: number
  discountAmount: number
  tax: number
  gratuity: number
  extraCharges: number
  total: number
  timestamp: Date
  signature?: string
  receiptMethod?: 'email' | 'phone' | 'none'
  contactInfo?: string
  employeeId: number
  paymentMethod: PaymentMethod
  voidInfo?: {
    voidedBy: number
    voidReason: string
    voidTimestamp: Date
  }
}

type ClientSettings = {
  freeLunchEnabled: boolean
  discountedToGoEnabled: boolean
  discountedToGoPercentage: number
}

const initialProducts: Product[] = [
  { id: 1, name: 'Apple', price: 0.5, category: 'grocery', stock: 100, image: '/placeholder.svg?height=100&width=100' },
  { id: 2, name: 'Bread', price: 2.0, category: 'grocery', stock: 100, image: '/placeholder.svg?height=100&width=100' },
  { id: 3, name: 'Milk', price: 3.0, category: 'grocery', stock: 100, image: '/placeholder.svg?height=100&width=100' },
  { id: 4, name: 'Burger', price: 5.0, category: 'fastfood', stock: 100, image: '/placeholder.svg?height=100&width=100' },
  { id: 5, name: 'Fries', price: 2.5, category: 'fastfood', stock: 100, image: '/placeholder.svg?height=100&width=100' },
  { id: 6, name: 'Soda', price: 1.5, category: 'fastfood', stock: 100, image: '/placeholder.svg?height=100&width=100' },
  { id: 7, name: 'Burger Meal', price: 8.0, category: 'bundle', stock: 100, bundleItems: [
    { productId: 4, quantity: 1 },
    { productId: 5, quantity: 1 },
    { productId: 6, quantity: 1 }
  ], image: '/placeholder.svg?height=100&width=100'},
]

const initialEmployees: Employee[] = [
  { id: 1, username: 'johndoe', password: bcrypt.hashSync('password123', 10), role: 'cashier', status: 'active', clockedIn: false, totalHours: 0, phoneNumber: '123-456-7890', socialSecurity: bcrypt.hashSync('123-45-6789', 10), email: 'john@example.com', address: '123 Main St, Anytown, USA' },
  { id: 2, username: 'janesmith', password: bcrypt.hashSync('password456', 10), role: 'manager', status: 'active', clockedIn: false, totalHours: 0, phoneNumber: '234-567-8901', socialSecurity: bcrypt.hashSync('234-56-7890', 10), email: 'jane@example.com', address: '456 Elm St, Anytown, USA' },
  { id: 3, username: 'alicejohnson', password: bcrypt.hashSync('password789', 10), role: 'admin', status: 'active', clockedIn: false, totalHours: 0, phoneNumber: '345-678-9012', socialSecurity: bcrypt.hashSync('345-67-8901', 10), email: 'alice@example.com', address: '789 Oak St, Anytown, USA' },
  { id: 4, username: 'bobwilliams', password: bcrypt.hashSync('password000', 10), role: 'owner', status: 'active', clockedIn: false, totalHours: 0, phoneNumber: '456-789-0123', socialSecurity: bcrypt.hashSync('456-78-9012', 10), email: 'bob@example.com', address: '012 Pine St, Anytown, USA' },
]

const initialClientSettings: ClientSettings = {
  freeLunchEnabled: true,
  discountedToGoEnabled: true,
  discountedToGoPercentage: 20,
}

export default function CashierInterface() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [order, setOrder] = useState<OrderItem[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage')
  const [discountValue, setDiscountValue] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [tax, setTax] = useState(0)
  const [gratuity, setGratuity] = useState(0)
  const [extraCharges, setExtraCharges] = useState(0)
  const [total, setTotal] = useState(0)
  const [customAmount, setCustomAmount] = useState('')
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)
  const [supplyAmount, setSupplyAmount] = useState('')
  const [newBundleName, setNewBundleName] = useState('')
  const [newBundlePrice, setNewBundlePrice] = useState('')
  const [newBundleItems, setNewBundleItems] = useState<{ productId: number; quantity: number }[]>([])
  const [taxRate, setTaxRate] = useState(0.1) // 10% default tax rate
  const [applyTax, setApplyTax] = useState(true)
  const [applyGratuity, setApplyGratuity] = useState(false)
  const [gratuityRate, setGratuityRate] = useState(0.15) // 15% default gratuity rate
  const [checkoutStep, setCheckoutStep] = useState(0)
  const [signature, setSignature] = useState('')
  const [receiptMethod, setReceiptMethod] = useState<'email' | 'phone' | 'none'>('none')
  const [contactInfo, setContactInfo] = useState('')
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [voidReason, setVoidReason] = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const [cashInRegister, setCashInRegister] = useState(1000) // Initial cash in register
  const [cashRemovalAmount, setCashRemovalAmount] = useState('')
  const [loginError, setLoginError] = useState('')
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [newEmployeeUsername, setNewEmployeeUsername] = useState('')
  const [newEmployeePassword, setNewEmployeePassword] = useState('')
  const [newEmployeeRole, setNewEmployeeRole] = useState<Role>('cashier')
  const [clientSettings, setClientSettings] = useState<ClientSettings>(initialClientSettings)
  const [isEmployeeOrder, setIsEmployeeOrder] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const newSubtotal = order.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    setSubtotal(newSubtotal)
    
    const newDiscountAmount = discountType === 'percentage' 
      ? newSubtotal * (discountValue / 100)
      : Math.min(discountValue, newSubtotal)
    setDiscountAmount(newDiscountAmount)
    
    let discountedSubtotal = newSubtotal - newDiscountAmount

    if (isEmployeeOrder && clientSettings.discountedToGoEnabled) {
      discountedSubtotal *= (1 - clientSettings.discountedToGoPercentage / 100)
    }
    
    const newTax = applyTax ? discountedSubtotal * taxRate : 0
    setTax(newTax)
    
    const newGratuity = applyGratuity ? discountedSubtotal * gratuityRate : 0
    setGratuity(newGratuity)
    
    const newTotal = discountedSubtotal + newTax + newGratuity + extraCharges
    setTotal(newTotal)
  }, [order, discountType, discountValue, taxRate, applyTax, applyGratuity, gratuityRate, extraCharges, isEmployeeOrder, clientSettings])

  const addToOrder = (product: Product) => {
    if (product.stock > 0) {
      const existingItem = order.find(item => item.product.id === product.id)
      if (existingItem) {
        setOrder(order.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ))
      } else {
        setOrder([...order, { product, quantity: 1 }])
      }
      updateProductStock(product.id, -1)
      if (product.category === 'bundle') {
        product.bundleItems?.forEach(item => {
          updateProductStock(item.productId, -item.quantity)
        })
      }
    } else {
      alert('This item is out of stock!')
    }
  }

  const removeFromOrder = (productId: number) => {
    const item = order.find(item => item.product.id === productId)
    if (item) {
      updateProductStock(productId, item.quantity)
      if (item.product.category === 'bundle') {
        item.product.bundleItems?.forEach(bundleItem => {
          updateProductStock(bundleItem.productId, bundleItem.quantity * item.quantity)
        })
      }
      setOrder(order.filter(item => item.product.id !== productId))
    }
  }

  const clearOrder = () => {
    order.forEach(item => {
      updateProductStock(item.product.id, item.quantity)
      if (item.product.category === 'bundle') {
        item.product.bundleItems?.forEach(bundleItem => {
          updateProductStock(bundleItem.productId, bundleItem.quantity * item.quantity)
        })
      }
    })
    setOrder([])
    setExtraCharges(0)
    setDiscountValue(0)
    setCheckoutStep(0)
    setSignature('')
    setReceiptMethod('none')
    setContactInfo('')
    setPaymentMethod('cash')
    setIsEmployeeOrder(false)
  }

  const addCustomAmount = () => {
    if (customAmount) {
      const customProduct: Product = {
        id: Date.now(),
        name: 'Custom Item',
        price: parseFloat(customAmount),
        category: 'grocery',
        stock: 1
      }
      addToOrder(customProduct)
      setCustomAmount('')
    }
  }

  const handleCheckout = () => {
    setCheckoutStep(1)
  }

  const completeCheckout = () => {
    if (!currentEmployee) {
      alert('Please log in to complete the checkout.')
      return
    }
    const newReceipt: Receipt = {
      id: Date.now(),
      items: [...order],
      subtotal: subtotal,
      discountAmount: discountAmount,
      tax: tax,
      gratuity: gratuity,
      extraCharges: extraCharges,
      total: total,
      timestamp: new Date(),
      signature: signature,
      receiptMethod: receiptMethod,
      contactInfo: contactInfo,
      employeeId: currentEmployee.id,
      paymentMethod: paymentMethod
    }
    setReceipts([...receipts, newReceipt])
    if (paymentMethod === 'cash') {
      setCashInRegister(cashInRegister + total)
    }
    clearOrder()
    alert(`Total: $${total.toFixed(2)}. Thank you for your purchase!`)
  }

  const duplicateReceipt = (receipt: Receipt) => {
    const duplicatedReceipt: Receipt = {
      ...receipt,
      id: Date.now(),
      timestamp: new Date()
    }
    setReceipts([...receipts, duplicatedReceipt])
  }

  const voidReceipt = (receiptId: number) => {
    if (!currentEmployee) {
      alert('Please log in to void a receipt.')
      return
    }
    const receipt = receipts.find(r => r.id ===    receiptId)
    if (receipt) {
      receipt.items.forEach(item => {
        updateProductStock(item.product.id, item.quantity)
        if (item.product.category === 'bundle') {
          item.product.bundleItems?.forEach(bundleItem => {
            updateProductStock(bundleItem.productId, bundleItem.quantity * item.quantity)
          })
        }
      })
      if (receipt.paymentMethod === 'cash') {
        setCashInRegister(cashInRegister - receipt.total)
      }
      setReceipts(receipts.map(r => 
        r.id === receiptId 
          ? { 
              ...r, 
              voidInfo: {
                voidedBy: currentEmployee.id,
                voidReason: voidReason,
                voidTimestamp: new Date()
              }
            }
          : r
      ))
      setVoidReason('')
    }
  }

  const processRefund = (receipt: Receipt) => {
    if (!currentEmployee || !['admin', 'manager', 'owner'].includes(currentEmployee.role)) {
      alert('You do not have permission to process refunds.')
      return
    }
    receipt.items.forEach(item => {
      updateProductStock(item.product.id, item.quantity)
      if (item.product.category === 'bundle') {
        item.product.bundleItems?.forEach(bundleItem => {
          updateProductStock(bundleItem.productId, bundleItem.quantity * item.quantity)
        })
      }
    })
    if (receipt.paymentMethod === 'cash') {
      setCashInRegister(cashInRegister - receipt.total)
    }
    setReceipts(receipts.filter(r => r.id !== receipt.id))
    alert(`Refund processed for $${receipt.total.toFixed(2)}`)
  }

  const updateProductStock = (productId: number, quantity: number) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { ...product, stock: product.stock + quantity }
        : product
    ))
  }

  const handleSupplyChange = (productId: number, change: 'in' | 'out') => {
    const amount = parseInt(supplyAmount)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid positive number')
      return
    }
    updateProductStock(productId, change === 'in' ? amount : -amount)
    setSupplyAmount('')
  }

  const generateInventoryReport = () => {
    let report = "End of Day Inventory Report:\n\n"
    products.forEach(product => {
      report += `${product.name}: ${product.stock} in stock\n`
    })
    alert(report)
  }

  const addNewBundle = () => {
    if (newBundleName && newBundlePrice && newBundleItems.length > 0) {
      const newBundle: Product = {
        id: Date.now(),
        name: newBundleName,
        price: parseFloat(newBundlePrice),
        category: 'bundle',
        stock: Math.min(...newBundleItems.map(item => {
          const product = products.find(p => p.id === item.productId)
          return product ? Math.floor(product.stock / item.quantity) : 0
        })),
        bundleItems: newBundleItems,
        image: '/placeholder.svg?height=100&width=100'
      }
      setProducts([...products, newBundle])
      setNewBundleName('')
      setNewBundlePrice('')
      setNewBundleItems([])
    } else {
      alert('Please fill in all bundle details')
    }
  }

  const handleImageUpload = (productId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProducts(products.map(product => 
          product.id === productId 
            ? { ...product, image: reader.result as string }
            : product
        ))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSignature = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (ctx) {
      ctx.beginPath()
      ctx.moveTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY)
      ctx.lineTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY)
      ctx.stroke()
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    setSignature('')
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (canvas) {
      setSignature(canvas.toDataURL())
    }
  }

  const handleLogin = (username: string, password: string) => {
    const employee = employees.find(e => e.username === username && e.status === 'active')
    if (employee && bcrypt.compareSync(password, employee.password)) {
      setCurrentEmployee(employee)
      setLoginError('')
    } else {
      setLoginError('Invalid username or password')
    }
  }

  const handleLogout = () => {
    if (currentEmployee && currentEmployee.clockedIn) {
      handleClockOut()
    }
    setCurrentEmployee(null)
    setShowSummary(false)
  }

  const handleClockIn = () => {
    if (currentEmployee) {
      setEmployees(employees.map(e => 
        e.id === currentEmployee.id 
          ? { ...e, clockedIn: true, lastClockIn: new Date() }
          : e
      ))
      setCurrentEmployee({ ...currentEmployee, clockedIn: true, lastClockIn: new Date() })
    }
  }

  const handleClockOut = () => {
    if (currentEmployee && currentEmployee.clockedIn && currentEmployee.lastClockIn) {
      const now = new Date()
      const hoursWorked = (now.getTime() - currentEmployee.lastClockIn.getTime()) / (1000 * 60 * 60)
      setEmployees(employees.map(e => 
        e.id === currentEmployee.id 
          ? { ...e, clockedIn: false, lastClockOut: now, totalHours: e.totalHours + hoursWorked }
          : e
      ))
      setCurrentEmployee({ ...currentEmployee, clockedIn: false, lastClockOut: now, totalHours: currentEmployee.totalHours + hoursWorked })
    }
  }

  const generateSalesSummary = () => {
    const validReceipts = receipts.filter(r => !r.voidInfo)
    const voidedReceipts = receipts.filter(r => r.voidInfo)
    
    const totalSales = validReceipts.reduce((sum, r) => sum + r.total, 0)
    const cashSales = validReceipts.filter(r => r.paymentMethod === 'cash').reduce((sum, r) => sum + r.total, 0)
    const creditSales = validReceipts.filter(r => r.paymentMethod === 'credit').reduce((sum, r) => sum + r.total, 0)
    
    const salesByEmployee = employees.map(employee => ({
      employeeName: employee.username,
      sales: validReceipts.filter(r => r.employeeId === employee.id).reduce((sum, r) => sum + r.total, 0)
    }))

    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">End of Day Sales Summary</h2>
        <p>Total Sales: ${totalSales.toFixed(2)}</p>
        <p>Cash Sales: ${cashSales.toFixed(2)}</p>
        <p>Credit Card Sales: ${creditSales.toFixed(2)}</p>
        <p>Cash in Register: ${cashInRegister.toFixed(2)}</p>
        <h3 className="text-xl font-bold mt-4 mb-2">Sales by Employee</h3>
        {salesByEmployee.map(employee => (
          <p key={employee.employeeName}>{employee.employeeName}: ${employee.sales.toFixed(2)}</p>
        ))}
        <h3 className="text-xl font-bold mt-4 mb-2">Voided Receipts</h3>
        {voidedReceipts.map(receipt => (
          <p key={receipt.id}>
            Receipt #{receipt.id} - ${receipt.total.toFixed(2)} - 
            Voided by: {employees.find(e => e.id === receipt.voidInfo?.voidedBy)?.username} - 
            Reason: {receipt.voidInfo?.voidReason}
          </p>
        ))}
        <h3 className="text-xl font-bold mt-4 mb-2">Detailed Sales Log</h3>
        {validReceipts.map(receipt => (
          <p key={receipt.id}>
            Receipt #{receipt.id} - ${receipt.total.toFixed(2)} - 
            {new Date(receipt.timestamp).toLocaleString()} - 
            Employee: {employees.find(e => e.id === receipt.employeeId)?.username} - 
            Payment: {receipt.paymentMethod}
          </p>
        ))}
      </div>
    )
  }

  const handleCashRemoval = () => {
    if (!currentEmployee || !['admin', 'manager', 'owner'].includes(currentEmployee.role)) {
      alert('You do not have permission to remove cash from the register.')
      return
    }
    const amount = parseFloat(cashRemovalAmount)
    if (isNaN(amount) || amount <= 0 || amount > cashInRegister) {
      alert('Please enter a valid amount to remove from the register.')
      return
    }
    setCashInRegister(cashInRegister - amount)
    setCashRemovalAmount('')
    alert(`$${amount.toFixed(2)} has been removed from the register.`)
  }

  const handleEmployeeEdit = (employee: Employee) => {
    setSelectedEmployee(employee)
  }

  const saveEmployeeChanges = () => {
    if (selectedEmployee) {
      setEmployees(employees.map(e => 
        e.id === selectedEmployee.id ? selectedEmployee : e
      ))
      setSelectedEmployee(null)
    }
  }

  const addNewEmployee = () => {
    if (newEmployeeUsername && newEmployeePassword) {
      const newEmployee: Employee = {
        id: Date.now(),
        username: newEmployeeUsername,
        password: bcrypt.hashSync(newEmployeePassword, 10),
        role: newEmployeeRole,
        status: 'active',
        clockedIn: false,
        totalHours: 0,
        phoneNumber: '',
        socialSecurity: '',
        email: '',
        address: ''
      }
      setEmployees([...employees, newEmployee])
      setNewEmployeeUsername('')
      setNewEmployeePassword('')
      setNewEmployeeRole('cashier')
    } else {
      alert('Please fill in all employee details')
    }
  }

  const updateEmployeeStatus = (employeeId: number, newStatus: EmployeeStatus) => {
    setEmployees(employees.map(e => 
      e.id === employeeId ? { ...e, status: newStatus } : e
    ))
  }

  const toggleFreeLunch = () => {
    setClientSettings({ ...clientSettings, freeLunchEnabled: !clientSettings.freeLunchEnabled })
  }

  const toggleDiscountedToGo = () => {
    setClientSettings({ ...clientSettings, discountedToGoEnabled: !clientSettings.discountedToGoEnabled })
  }

  const updateDiscountedToGoPercentage = (percentage: number) => {
    setClientSettings({ ...clientSettings, discountedToGoPercentage: percentage })
  }

  return (
    <div className="flex h-screen">
      <div className="w-2/3 p-4">
        {!currentEmployee ? (
          <Card>
            <CardHeader>
              <CardTitle>Employee Login</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" type="text" />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" />
                </div>
                <Button onClick={() => {
                  const username = (document.getElementById('username') as HTMLInputElement).value
                  const password = (document.getElementById('password') as HTMLInputElement).value
                  handleLogin(username, password)
                }}>
                  Login
                </Button>
                {loginError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        ) : showSummary ? (
          <Card>
            <CardHeader>
              <CardTitle>Sales Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {generateSalesSummary()}
              <Button onClick={() => setShowSummary(false)} className="mt-4">Back to Cashier</Button>
            </CardContent>
          </Card>
        ) : checkoutStep === 0 ? (
          <Tabs defaultValue="products">
            <TabsList>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="bundles">Bundles</TabsTrigger>
              {['admin', 'owner'].includes(currentEmployee.role) && (
                <TabsTrigger value="employees">Employees</TabsTrigger>
              )}
              {['admin', 'owner'].includes(currentEmployee.role) && (
                <TabsTrigger value="settings">Settings</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <CardTitle>Product List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {products.map(product => (
                      <Button key={product.id} onClick={() => addToOrder(product)} className="h-40 flex flex-col items-center justify-between p-2" disabled={product.stock === 0}>
                        <img src={product.image} alt={product.name} className="w-20 h-20 object-cover mb-2" />
                        {product.name}<br />${product.price.toFixed(2)}<br />Stock: {product.stock}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="inventory">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map(product => (
                        <TableRow key={product.id}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                placeholder="Amount"
                                value={supplyAmount}
                                onChange={(e) => setSupplyAmount(e.target.value)}
                                className="w-20"
                              />
                              <Button onClick={() => handleSupplyChange(product.id, 'in')}>In</Button>
                              <Button onClick={() => handleSupplyChange(product.id, 'out')}>Out</Button>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(product.id, e)}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Button onClick={generateInventoryReport} className="mt-4">Generate End of Day Report</Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="bundles">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Bundle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bundleName">Bundle Name</Label>
                        <Input id="bundleName" value={newBundleName} onChange={(e) => setNewBundleName(e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="bundlePrice">Bundle Price</Label>
                        <Input id="bundlePrice" type="number" value={newBundlePrice} onChange={(e) => setNewBundlePrice(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <Label>Add Items to Bundle</Label>
                      <div className="flex items-center space-x-2">
                        <Select onValueChange={(value) => setNewBundleItems([...newBundleItems, { productId: parseInt(value), quantity: 1 }])}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.filter(p => p.category !== 'bundle').map(product => (
                              <SelectItem key={product.id} value={product.id.toString()}>{product.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Bundle Items</Label>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {newBundleItems.map((item, index) => {
                            const product = products.find(p => p.id === item.productId)
                            return product ? (
                              <TableRow key={index}>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => {
                                      const newItems = [...newBundleItems]
                                      newItems[index].quantity = parseInt(e.target.value)
                                      setNewBundleItems(newItems)
                                    }}
                                    className="w-20"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button onClick={() => setNewBundleItems(newBundleItems.filter((_, i) => i !== index))}>
                                    Remove
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ) : null
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    <Button onClick={addNewBundle}>Create Bundle</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            {['admin', 'owner'].includes(currentEmployee.role) && (
              <TabsContent value="employees">
                <Card>
                  <CardHeader>
                    <CardTitle>Employee Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Username</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {employees.map(employee => (
                          <TableRow key={employee.id}>
                            <TableCell>{employee.username}</TableCell>
                            <TableCell>{employee.role}</TableCell>
                            <TableCell>{employee.status}</TableCell>
                            <TableCell>
                              <Button onClick={() => handleEmployeeEdit(employee)}>Edit</Button>
                              <Select onValueChange={(value) => updateEmployeeStatus(employee.id, value as EmployeeStatus)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Update Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="fired">Fired</SelectItem>
                                  <SelectItem value="terminated">Terminated</SelectItem>
                                  <SelectItem value="eligible_for_rehire">Eligible for Rehire</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2">Add New Employee</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <Input
                          placeholder="Username"
                          value={newEmployeeUsername}
                          onChange={(e) => setNewEmployeeUsername(e.target.value)}
                        />
                        <Input
                          type="password"
                          placeholder="Password"
                          value={newEmployeePassword}
                          onChange={(e) => setNewEmployeePassword(e.target.value)}
                        />
                        <Select onValueChange={(value) => setNewEmployeeRole(value as Role)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cashier">Cashier</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="owner">Owner</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={addNewEmployee} className="mt-2">Add Employee</Button>
                    </div>
                  </CardContent>
                </Card>
                {selectedEmployee && (
                  <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Employee</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="username" className="text-right">
                            Username
                          </Label>
                          <Input
                            id="username"
                            value={selectedEmployee.username}
                            onChange={(e) => setSelectedEmployee({ ...selectedEmployee, username: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="password" className="text-right">
                            Password
                          </Label>
                          <div className="col-span-3 flex">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              value={selectedEmployee.password}
                              onChange={(e) => setSelectedEmployee({ ...selectedEmployee, password: e.target.value })}
                              className="flex-grow"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="role" className="text-right">
                            Role
                          </Label>
                          <Select
                            onValueChange={(value) => setSelectedEmployee({ ...selectedEmployee, role: value as Role })}
                            defaultValue={selectedEmployee.role}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cashier">Cashier</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="owner">Owner</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="phoneNumber" className="text-right">
                            Phone Number
                          </Label>
                          <Input
                            id="phoneNumber"
                            value={selectedEmployee.phoneNumber}
                            onChange={(e) => setSelectedEmployee({ ...selectedEmployee, phoneNumber: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="email" className="text-right">
                            Email
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={selectedEmployee.email}
                            onChange={(e) => setSelectedEmployee({ ...selectedEmployee, email: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="address" className="text-right">
                            Address
                          </Label>
                          <Input
                            id="address"
                            value={selectedEmployee.address}
                            onChange={(e) => setSelectedEmployee({ ...selectedEmployee, address: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        {currentEmployee.role === 'owner' && (
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="socialSecurity" className="text-right">
                              Social Security
                            </Label>
                            <Input
                              id="socialSecurity"
                              type="password"
                              value={selectedEmployee.socialSecurity}
                              onChange={(e) => setSelectedEmployee({ ...selectedEmployee, socialSecurity: e.target.value })}
                              className="col-span-3"
                            />
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button onClick={saveEmployeeChanges}>Save changes</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </TabsContent>
            )}
            {['admin', 'owner'].includes(currentEmployee.role) && (
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Client Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={clientSettings.freeLunchEnabled}
                          onCheckedChange={toggleFreeLunch}
                          id="free-lunch"
                        />
                        <Label htmlFor="free-lunch">Enable Free Lunch for Employees</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={clientSettings.discountedToGoEnabled}
                          onCheckedChange={toggleDiscountedToGo}
                          id="discounted-to-go"
                        />
                        <Label htmlFor="discounted-to-go">Enable Discounted To-Go Orders for Employees</Label>
                      </div>
                      {clientSettings.discountedToGoEnabled && (
                        <div>
                          <Label htmlFor="discount-percentage">Discounted To-Go Percentage</Label>
                          <Input
                            id="discount-percentage"
                            type="number"
                            value={clientSettings.discountedToGoPercentage}
                            onChange={(e) => updateDiscountedToGoPercentage(parseInt(e.target.value))}
                            min="0"
                            max="100"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Checkout</CardTitle>
            </CardHeader>
            <CardContent>
              {checkoutStep === 1 && (
                <>
                  <h3 className="text-lg font-semibold mb-2">Review Your Order</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.map(item => (
                        <TableRow key={item.product.id}>
                          <TableCell>{item.product.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>${(item.product.price * item.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4">
                    <p>Subtotal: ${subtotal.toFixed(2)}</p>
                    <p>Discount: ${discountAmount.toFixed(2)}</p>
                    <p>Tax: ${tax.toFixed(2)}</p>
                    <p>Extra Charges: ${extraCharges.toFixed(2)}</p>
                    <p className="font-bold">Total: ${total.toFixed(2)}</p>
                  </div>
                  <div className="mt-4">
                    <Label>Select Gratuity</Label>
                    <Slider
                      defaultValue={[gratuityRate * 100]}
                      max={30}
                      step={1}
                      onValueChange={(value) => setGratuityRate(value[0] / 100)}
                    />
                    <p>Gratuity: {(gratuityRate * 100).toFixed(0)}% (${gratuity.to Fixed(2)})</p>
                  </div>
                  <div className="mt-4">
                    <Label>Payment Method</Label>
                    <RadioGroup value={paymentMethod} onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash">Cash</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="credit" id="credit" />
                        <Label htmlFor="credit">Credit Card</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="employee-order">Employee Order</Label>
                    <Switch
                      id="employee-order"
                      checked={isEmployeeOrder}
                      onCheckedChange={setIsEmployeeOrder}
                    />
                  </div>
                  <Button className="mt-4" onClick={() => setCheckoutStep(2)}>Next</Button>
                </>
              )}
              {checkoutStep === 2 && (
                <>
                  <h3 className="text-lg font-semibold mb-2">Signature</h3>
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={200}
                    className="border border-gray-300"
                    onMouseDown={handleSignature}
                    onMouseMove={(e) => e.buttons === 1 && handleSignature(e)}
                  />
                  <div className="flex space-x-2 mt-2">
                    <Button onClick={clearSignature}>Clear</Button>
                    <Button onClick={saveSignature}>Save</Button>
                  </div>
                  <div className="mt-4">
                    <Label>Receipt Method</Label>
                    <RadioGroup value={receiptMethod} onValueChange={(value: 'email' | 'phone' | 'none') => setReceiptMethod(value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="email" />
                        <Label htmlFor="email">Email</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="phone" id="phone" />
                        <Label htmlFor="phone">Phone</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id="none" />
                        <Label htmlFor="none">No Receipt</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {receiptMethod !== 'none' && (
                    <div className="mt-4">
                      <Label htmlFor="contactInfo">
                        {receiptMethod === 'email' ? 'Email Address' : 'Phone Number'}
                      </Label>
                      <Input
                        id="contactInfo"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        placeholder={receiptMethod === 'email' ? 'Enter email address' : 'Enter phone number'}
                      />
                    </div>
                  )}
                  <Button className="mt-4" onClick={completeCheckout}>Complete Purchase</Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      <div className="w-1/3 p-4 flex flex-col">
        {currentEmployee && (
          <Card className="mb-4">
            <CardContent>
              <div className="flex justify-between items-center">
                <span>Logged in as: {currentEmployee.username} ({currentEmployee.role})</span>
                <div>
                  {currentEmployee.clockedIn ? (
                    <Button onClick={handleClockOut}>Clock Out</Button>
                  ) : (
                    <Button onClick={handleClockIn}>Clock In</Button>
                  )}
                  <Button onClick={handleLogout} className="ml-2">Logout</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <Card className="flex-grow mb-4">
          <CardHeader>
            <CardTitle>Current Order</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-600px)]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.map(item => (
                    <TableRow key={item.product.id}>
                      <TableCell>{item.product.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${(item.product.price * item.quantity).toFixed(2)}</TableCell>
                      <TableCell>
                        <Button variant="destructive" size="sm" onClick={() => removeFromOrder(item.product.id)}>
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="mb-4">
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Input
                type="number"
                placeholder="Custom Amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
              <Button onClick={addCustomAmount}>Add</Button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <Label>Discount:</Label>
                <RadioGroup defaultValue="percentage" className="flex space-x-2" onValueChange={(value) => setDiscountType(value as 'percentage' | 'amount')}>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="percentage" id="percentage" />
                    <Label htmlFor="percentage">%</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="amount" id="amount" />
                    <Label htmlFor="amount">$</Label>
                  </div>
                </RadioGroup>
                <Input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value))}
                  className="w-20"
                />
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={applyTax}
                    onCheckedChange={setApplyTax}
                    id="apply-tax"
                  />
                  <Label htmlFor="apply-tax">Apply Tax</Label>
                </div>
                <Input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                  className="w-20"
                  disabled={!applyTax}
                />
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={applyGratuity}
                    onCheckedChange={setApplyGratuity}
                    id="apply-gratuity"
                  />
                  <Label htmlFor="apply-gratuity">Apply Gratuity</Label>
                </div>
                <Input
                  type="number"
                  value={gratuityRate}
                  onChange={(e) => setGratuityRate(parseFloat(e.target.value))}
                  className="w-20"
                  disabled={!applyGratuity}
                />
                <span>${gratuity.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="extra-charges">Extra Charges</Label>
                <Input
                  id="extra-charges"
                  type="number"
                  value={extraCharges}
                  onChange={(e) => setExtraCharges(parseFloat(e.target.value))}
                  className="w-20"
                />
              </div>
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Button onClick={clearOrder} variant="outline">Void Order</Button>
              <Button onClick={handleCheckout}>Checkout</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Receipts</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-40">
              {receipts.map(receipt => (
                <div key={receipt.id} className="flex justify-between items-center mb-2">
                  <span>Receipt #{receipt.id} - ${receipt.total.toFixed(2)}</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedReceipt(receipt)}>
                        Actions
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Receipt Actions</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Button onClick={() => duplicateReceipt(receipt)}>Duplicate Receipt</Button>
                        {!receipt.voidInfo && (
                          <>
                            <Textarea
                              placeholder="Void reason"
                              value={voidReason}
                              onChange={(e) => setVoidReason(e.target.value)}
                            />
                            <Button onClick={() => voidReceipt(receipt.id)}>Void Receipt</Button>
                          </>
                        )}
                        <Button onClick={() => processRefund(receipt)}>Process Refund</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
        {currentEmployee && (
          <div className="mt-4 space-y-4">
            <Button onClick={() => setShowSummary(true)}>
              View Sales Summary
            </Button>
            {['admin', 'manager', 'owner'].includes(currentEmployee.role) && (
              <Card>
                <CardHeader>
                  <CardTitle>Cash Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="Amount to remove"
                      value={cashRemovalAmount}
                      onChange={(e) => setCashRemovalAmount(e.target.value)}
                    />
                    <Button onClick={handleCashRemoval}>Remove Cash</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}