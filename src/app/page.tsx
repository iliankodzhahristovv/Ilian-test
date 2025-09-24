"use client"

import React, { useState, useEffect } from 'react'
import { getExpenses, addExpense, updateExpense, deleteExpense } from '@/lib/expenses'
import type { Expense } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import Auth from '@/components/Auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Filter, DollarSign, Calendar, TrendingUp, Edit, Trash2, Copy, ArrowUpDown, ChevronUp, ChevronDown, ChevronRight, Menu, Home, Settings, BarChart3, X } from 'lucide-react'
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Utility function for category colors (badges)
const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    'Food': 'bg-green-100 text-green-800',
    'Gas': 'bg-yellow-100 text-yellow-800',
    'Entertainment': 'bg-red-100 text-red-800',
    'Planned': 'bg-blue-100 text-blue-800',
    'Car': 'bg-purple-100 text-purple-800',
    'Fitness': 'bg-emerald-400 text-emerald-900',
    'Clothes': 'bg-yellow-300 text-yellow-900',
    'Necessary': 'bg-orange-100 text-orange-800',
    'Barber': 'bg-gray-100 text-gray-800',
  }
  return colors[category] || 'bg-gray-100 text-gray-800'
}



// Settings Page Component
function SettingsPage() {
  const { user, signOut } = useAuth()

  return (
    <div className="space-y-6">
      {/* Header - matching dashboard style */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            ⚙️ Settings
          </h1>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Account Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">👤 Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 text-gray-900 font-medium">{user?.email}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Account ID</label>
              <div className="mt-1 text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded border">{user?.id}</div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">🎨 Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Currency</label>
                <p className="text-xs text-gray-500">Default currency for expenses</p>
              </div>
              <Select defaultValue="bgn">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bgn">BGN (лв)</SelectItem>
                  <SelectItem value="eur">EUR (€)</SelectItem>
                  <SelectItem value="usd">USD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Date Format</label>
                <p className="text-xs text-gray-500">How dates are displayed</p>
              </div>
              <Select defaultValue="dd-mm-yyyy">
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">💾 Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Export Data</label>
                <p className="text-xs text-gray-500">Download your expenses as CSV</p>
              </div>
              <Button variant="outline" size="sm">
                Export CSV
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Backup Data</label>
                <p className="text-xs text-gray-500">Create a backup of all your data</p>
              </div>
              <Button variant="outline" size="sm">
                Create Backup
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-red-700">⚠️ Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-red-700">Sign Out</label>
                <p className="text-xs text-gray-500">Sign out of your account</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => signOut()} className="text-red-600 border-red-600 hover:bg-red-50">
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Charts Page Component using Recharts  
function ChartsPage({ expenses }: { expenses: Expense[] }) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("Entertainment")

  // Calculate category data from actual expenses
  const categoryData = React.useMemo(() => {
    const categoryMap = new Map<string, { total: number; count: number }>()
    
    expenses.forEach(expense => {
      const current = categoryMap.get(expense.category) || { total: 0, count: 0 }
      current.total += expense.amount
      current.count += 1
      categoryMap.set(expense.category, current)
    })
    
    return Array.from(categoryMap.entries())
      .map(([name, data]) => ({
        name,
        amount: data.total.toFixed(2),
        count: data.count,
        percentage: 0 // Will calculate after we have total
      }))
      .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
  }, [expenses])

  // Calculate monthly data from actual expenses
  const yearlyChartData = React.useMemo(() => {
    const data: { [key: string]: Array<{ month: string; amount: number }> } = {}
    const currentYear = new Date().getFullYear()
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    // Initialize all categories with zero amounts for all months
    categoryData.forEach(category => {
      data[category.name] = monthNames.map(month => ({ month, amount: 0 }))
    })
    
    // Fill in actual data
    expenses.forEach(expense => {
      // Handle different date formats (DD/MM/YYYY, YYYY-MM-DD, etc.)
      let expenseDate: Date
      if (expense.date.includes('/')) {
        // DD/MM/YYYY format
        const [day, month, year] = expense.date.split('/')
        expenseDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      } else {
        // YYYY-MM-DD format or other standard formats
        expenseDate = new Date(expense.date)
      }
      
      const expenseYear = expenseDate.getFullYear()
      
      if (expenseYear === currentYear && data[expense.category]) {
        const monthIndex = expenseDate.getMonth()
        data[expense.category][monthIndex].amount += expense.amount
      }
    })
    
    return data
  }, [expenses, categoryData])

  // Auto-select first category if none selected or if selected category doesn't exist
  React.useEffect(() => {
    if (categoryData.length > 0 && (!selectedCategory || !categoryData.find(c => c.name === selectedCategory))) {
      setSelectedCategory(categoryData[0].name)
    }
  }, [categoryData, selectedCategory])


  const categoryBadgeColors = {
    Entertainment: "bg-pink-100 text-pink-800 hover:bg-pink-200",
    Gas: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    Food: "bg-green-100 text-green-800 hover:bg-green-200", 
    Necessary: "bg-orange-100 text-orange-800 hover:bg-orange-200",
    Car: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    Planned: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    Clothes: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    Fitness: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
    Barber: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  }

  return (
    <div className="space-y-6 p-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Charts
          </h1>
          <p className="text-muted-foreground">Breakdown of spending by category</p>
        </div>
      </div>

      {/* Category Selection */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Category Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No expense data available yet</p>
              <p className="text-sm">Start adding expenses to see your category breakdown</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {categoryData.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedCategory === category.name
                        ? "border-blue-500 bg-blue-50"
                        : "border-border hover:border-blue-300"
                    }`}
                  >
                    <div className="text-left space-y-1">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          categoryBadgeColors[category.name as keyof typeof categoryBadgeColors] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {category.name}
                      </span>
                      <div className="text-sm font-semibold text-foreground">{category.amount} лв</div>
                      <div className="text-xs text-muted-foreground">{category.count} expenses</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Chart */}
              {selectedCategory && yearlyChartData[selectedCategory] && (
                <div className="bg-white rounded-lg border p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{selectedCategory} Spending</h3>
                    <p className="text-gray-600">Monthly spending throughout the year</p>
                  </div>

                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={yearlyChartData[selectedCategory]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                          tickFormatter={(value) => `${value} лв`}
                          width={80}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                          formatter={(value: number) => [`${value} лв`, selectedCategory]}
                        />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="#1f2937"
                          strokeWidth={2}
                          dot={{ fill: "#1f2937", strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, fill: "#1f2937" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
  })
  const [editExpense, setEditExpense] = useState({
    description: '',
    amount: '',
    category: '',
    date: ''
  })
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [sortConfig, setSortConfig] = useState<{
    column: 'date' | 'category' | 'amount' | 'description'
    direction: 'asc' | 'desc'
  }>({ column: 'date', direction: 'desc' }) // Default: newest first
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'settings' | 'charts'>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Group expenses by month (YYYY-MM format)
  const groupExpensesByMonth = (expenses: Expense[]) => {
    const grouped = new Map<string, Expense[]>()
    
    expenses.forEach(expense => {
      // Parse DD/MM/YYYY to get YYYY-MM
      const [, month, year] = expense.date.split('/')
      const monthKey = `${year}-${month.padStart(2, '0')}`
      
      if (!grouped.has(monthKey)) {
        grouped.set(monthKey, [])
      }
      grouped.get(monthKey)!.push(expense)
    })
    
    return grouped
  }

  // Toggle month expansion
  const toggleMonth = (monthKey: string) => {
    setExpandedMonths(prev => {
      const newSet = new Set(prev)
      if (newSet.has(monthKey)) {
        newSet.delete(monthKey)
      } else {
        newSet.add(monthKey)
      }
      return newSet
    })
  }

  // Format month key to display name
  const formatMonthDisplay = (monthKey: string) => {
    const [year, month] = monthKey.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  // Handle month selection (for summary cards)
  const handleMonthSelect = (monthKey: string) => {
    setSelectedMonth(selectedMonth === monthKey ? null : monthKey)
    // Auto-expand the selected month
    if (selectedMonth !== monthKey) {
      setExpandedMonths(prev => new Set([...prev, monthKey]))
    }
  }

  // Clear month selection
  const clearMonthSelection = () => {
    setSelectedMonth(null)
  }

  // Get current year expenses (for default view)
  const getCurrentYearExpenses = (expenses: Expense[]) => {
    const currentYear = new Date().getFullYear().toString()
    return expenses.filter(expense => {
      const [, , year] = expense.date.split('/')
      return year === currentYear
    })
  }


  // Calculate smart average (total / months with expenses, not all 12 months)
  const calculateSmartAverage = (expenses: Expense[]) => {
    if (expenses.length === 0) return 0
    
    const monthsWithExpenses = new Set()
    expenses.forEach(expense => {
      const [, month, year] = expense.date.split('/')
      monthsWithExpenses.add(`${year}-${month.padStart(2, '0')}`)
    })
    
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    return totalAmount / monthsWithExpenses.size
  }

  // Get category breakdown for a specific month
  const getCategoryBreakdown = (expenses: Expense[]) => {
    const monthTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    
    const categoryMap = new Map<string, { total: number, count: number }>()
    
    expenses.forEach(expense => {
      const existing = categoryMap.get(expense.category) || { total: 0, count: 0 }
      categoryMap.set(expense.category, {
        total: existing.total + expense.amount,
        count: existing.count + 1
      })
    })
    
    const breakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      percentage: monthTotal > 0 ? (data.total / monthTotal) * 100 : 0
    }))
    
    // Sort by total amount (highest first)
    return breakdown.sort((a, b) => b.total - a.total)
  }

  const filteredAndSortedExpenses = (() => {
    // First apply category filter
    const filtered = filterCategory 
    ? expenses.filter(expense => expense.category === filterCategory)
    : expenses

    // Then sort by the selected criteria
    return filtered.sort((a, b) => {
      let result = 0

      switch (sortConfig.column) {
        case 'date': {
          // Convert DD/MM/YYYY to Date objects for proper sorting
          const parseDate = (dateStr: string) => {
            const [day, month, year] = dateStr.split('/')
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
          }

          const dateA = parseDate(a.date)
          const dateB = parseDate(b.date)
          result = dateA.getTime() - dateB.getTime()
          break
        }
        
        case 'category':
          result = a.category.localeCompare(b.category)
          break
        
        case 'amount':
          result = a.amount - b.amount
          break
        
        case 'description':
          result = a.description.localeCompare(b.description)
          break
        
        default:
          result = 0
      }

      // Apply direction (asc or desc)
      return sortConfig.direction === 'desc' ? -result : result
    })
  })()

  // Context-aware statistics based on selection
  const statisticsData = (() => {
    // Only show month stats if month is selected AND expanded
    if (selectedMonth && expandedMonths.has(selectedMonth)) {
      // Show selected month statistics
      const selectedMonthExpenses = filteredAndSortedExpenses.filter(expense => {
        const [, month, year] = expense.date.split('/')
        const expenseMonthKey = `${year}-${month.padStart(2, '0')}`
        return expenseMonthKey === selectedMonth
      })
      
      return {
        total: selectedMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0),
        count: selectedMonthExpenses.length, // Count for selected month
        average: selectedMonthExpenses.length > 0 
          ? selectedMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0) / selectedMonthExpenses.length 
          : 0,
        isMonthSelected: true,
        selectedMonthName: formatMonthDisplay(selectedMonth)
      }
    } else {
      // Show current year statistics (default or when month selected but not expanded)
      const currentYearExpenses = getCurrentYearExpenses(filteredAndSortedExpenses)
      
      return {
        total: currentYearExpenses.reduce((sum, expense) => sum + expense.amount, 0),
        count: currentYearExpenses.length, // Count for entire year
        average: calculateSmartAverage(currentYearExpenses),
        isMonthSelected: false,
        selectedMonthName: null
      }
    }
  })()

  const categories = Array.from(new Set(expenses.map(expense => expense.category)))

  // Group filtered and sorted expenses by month
  const groupedExpenses = groupExpensesByMonth(filteredAndSortedExpenses)
  
  // Sort months in descending order (newest first)
  const sortedMonths = Array.from(groupedExpenses.keys()).sort((a, b) => {
    return b.localeCompare(a) // Newest first (2025-11 > 2025-08)
  })

  // Load expenses from Supabase
  const loadExpenses = async () => {
      setLoading(true)
      try {
        const data = await getExpenses()
        setExpenses(data)
        console.log('✅ LOADED', data.length, 'expenses from Supabase')
      } catch (error) {
        console.error('Error loading expenses from Supabase:', error)
        setExpenses([])
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    loadExpenses()
  }, [])

  const handleSort = (column: 'date' | 'category' | 'amount' | 'description') => {
    setSortConfig(prevConfig => ({
      column,
      direction: prevConfig.column === column && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const getSortIcon = (column: 'date' | 'category' | 'amount' | 'description') => {
    if (sortConfig.column !== column) {
      return <ArrowUpDown className="h-4 w-4 opacity-40" />
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />
  }



  // Exchange rate: 1 EUR = 1.96 BGN (approximate)
  const BGN_TO_EUR_RATE = 1.96



  const handleAddExpense = async () => {
    if (newExpense.description && newExpense.amount && newExpense.category && newExpense.date) {
      try {
        // Convert YYYY-MM-DD to DD/MM/YYYY format for display
        const [year, month, day] = newExpense.date.split('-')
        const formattedDate = `${day}/${month}/${year}`
        
        const expenseData = {
          description: newExpense.description,
          amount: parseFloat(newExpense.amount),
          category: newExpense.category,
          date: formattedDate
        }
        
        const savedExpense = await addExpense(expenseData)
        if (savedExpense) {
          setExpenses([savedExpense, ...expenses])
          setNewExpense({ 
            description: '', 
            amount: '', 
            category: '', 
            date: new Date().toISOString().split('T')[0] // Reset to today's date
          })
          setIsAddDialogOpen(false)
          console.log('✅ Expense added to Supabase:', savedExpense)
        } else {
          console.error('Failed to save expense to Supabase')
          alert('Failed to save expense. Please try again.')
        }
      } catch (error) {
        console.error('Error adding expense:', error)
        alert('Error adding expense. Please try again.')
      }
    }
  }

  const handleEditExpense = async () => {
    if (editingExpense && editExpense.description && editExpense.amount && editExpense.category && editExpense.date) {
      try {
        // Convert YYYY-MM-DD to DD/MM/YYYY format for display
        const [year, month, day] = editExpense.date.split('-')
        const formattedDate = `${day}/${month}/${year}`
        
        const updates = {
          description: editExpense.description,
          amount: parseFloat(editExpense.amount),
          category: editExpense.category,
          date: formattedDate
        }
        
        const updatedExpense = await updateExpense(editingExpense.id, updates)
        if (updatedExpense) {
          const updatedExpenses = expenses.map(expense => 
            expense.id === editingExpense.id ? updatedExpense : expense
          )
          setExpenses(updatedExpenses)
          setEditExpense({ description: '', amount: '', category: '', date: '' })
          setEditingExpense(null)
          setIsEditDialogOpen(false)
          console.log('✅ Expense updated in Supabase:', updatedExpense)
        } else {
          console.error('Failed to update expense in Supabase')
          alert('Failed to update expense. Please try again.')
        }
      } catch (error) {
        console.error('Error updating expense:', error)
        alert('Error updating expense. Please try again.')
      }
    }
  }

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const success = await deleteExpense(expenseId)
      if (success) {
        setExpenses(expenses.filter(expense => expense.id !== expenseId))
        console.log('✅ Expense deleted from Supabase:', expenseId)
      } else {
        console.error('Failed to delete expense from Supabase')
        alert('Failed to delete expense. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
      alert('Error deleting expense. Please try again.')
    }
  }

  const handleDuplicateExpense = async (expenseId: string) => {
    try {
      const expenseToDuplicate = expenses.find(expense => expense.id === expenseId)
      if (expenseToDuplicate) {
        const duplicateData = {
          description: expenseToDuplicate.description,
          amount: expenseToDuplicate.amount,
          category: expenseToDuplicate.category,
          date: new Date().toLocaleDateString('en-GB')
        }
        
        const savedExpense = await addExpense(duplicateData)
        if (savedExpense) {
          setExpenses([savedExpense, ...expenses])
          console.log('✅ Expense duplicated in Supabase:', savedExpense)
        } else {
          console.error('Failed to duplicate expense in Supabase')
          alert('Failed to duplicate expense. Please try again.')
        }
      }
    } catch (error) {
      console.error('Error duplicating expense:', error)
      alert('Error duplicating expense. Please try again.')
    }
  }

  const openEditDialog = (expense: Expense) => {
    console.log('Opening edit dialog for expense:', expense.id)
    setEditingExpense(expense)
    
    // Convert DD/MM/YYYY to YYYY-MM-DD format for the date input
    const [day, month, year] = expense.date.split('/')
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    
    setEditExpense({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      date: isoDate
    })
    setIsEditDialogOpen(true)
  }


  // Sidebar Component
  const Sidebar = () => (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:z-auto lg:h-screen`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-green-600" />
              <span className="font-bold text-gray-900">Expense Tracker</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              <button
                onClick={() => {
                  setCurrentPage('dashboard')
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  currentPage === 'dashboard'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Home className="h-5 w-5" />
                Dashboard
              </button>
              
              <button
                onClick={() => {
                  setCurrentPage('charts')
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  currentPage === 'charts'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                Charts
              </button>
              
              <button
                onClick={() => {
                  setCurrentPage('settings')
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  currentPage === 'settings'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Settings className="h-5 w-5" />
                Settings
              </button>
            </div>
          </nav>
          
          {/* User Info */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Signed in as
            </div>
            <div className="font-medium text-gray-900 truncate">
              {user?.email}
            </div>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-0 overflow-auto">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="font-bold text-gray-900">Expense Tracker</span>
            </div>
            <div className="w-8" /> {/* Spacer for centering */}
          </div>
        </div>
        
        {/* Page Content */}
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            {currentPage === 'dashboard' && (
              <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              💰 Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.email}!</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-black text-white hover:bg-gray-800">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </DialogTrigger>
            <DialogContent className="!w-[calc(100vw-3rem)] !max-w-md rounded-lg sm:!w-[calc(100vw-4rem)]">
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <Select value={newExpense.category} onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Gas">Gas</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                      <SelectItem value="Planned">Planned</SelectItem>
                      <SelectItem value="Car">Car</SelectItem>
                      <SelectItem value="Fitness">Fitness</SelectItem>
                      <SelectItem value="Clothes">Clothes</SelectItem>
                      <SelectItem value="Necessary">Necessary</SelectItem>
                      <SelectItem value="Barber">Barber</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Enter description..."
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    required
                  />
                </div>
                <Button onClick={handleAddExpense} className="w-full">
                  Add Expense
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="mx-10 rounded-lg max-w-md sm:mx-8">
              <DialogHeader>
                <DialogTitle>Edit Expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={editExpense.amount}
                    onChange={(e) => setEditExpense({ ...editExpense, amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <Select value={editExpense.category} onValueChange={(value) => setEditExpense({ ...editExpense, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Gas">Gas</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                      <SelectItem value="Planned">Planned</SelectItem>
                      <SelectItem value="Car">Car</SelectItem>
                      <SelectItem value="Fitness">Fitness</SelectItem>
                      <SelectItem value="Clothes">Clothes</SelectItem>
                      <SelectItem value="Necessary">Necessary</SelectItem>
                      <SelectItem value="Barber">Barber</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Enter description..."
                    value={editExpense.description}
                    onChange={(e) => setEditExpense({ ...editExpense, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={editExpense.date}
                    onChange={(e) => setEditExpense({ ...editExpense, date: e.target.value })}
                    required
                  />
                </div>
                <Button onClick={handleEditExpense} className="w-full">
                  Update Expense
                </Button>
              </div>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="space-y-4">
          {/* View All Months Button - shown when month is selected AND expanded */}
          {selectedMonth && expandedMonths.has(selectedMonth) && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-700">
                  Viewing {formatMonthDisplay(selectedMonth)}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearMonthSelection}
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                View All Months
              </Button>
            </div>
          )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className={statisticsData.isMonthSelected ? 'bg-blue-50 border-blue-200' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {statisticsData.isMonthSelected ? 'Month Total' : 'Total Spent (This Year)'}
                </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{statisticsData.total.toFixed(2)} лв</div>
                <div className="text-sm text-gray-500">€{(statisticsData.total / BGN_TO_EUR_RATE).toFixed(2)}</div>
            </CardContent>
          </Card>

            <Card className={statisticsData.isMonthSelected ? 'bg-blue-50 border-blue-200' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {statisticsData.isMonthSelected ? 'Transactions' : 'This Year'}
                </CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{statisticsData.count}</div>
                <div className="text-sm text-gray-500">
                  {statisticsData.isMonthSelected ? 'expenses' : 'total expenses'}
                </div>
            </CardContent>
          </Card>

            <Card className={statisticsData.isMonthSelected ? 'bg-blue-50 border-blue-200' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {statisticsData.isMonthSelected ? 'Avg per Expense' : 'Monthly Average'}
                </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{statisticsData.average.toFixed(2)} лв</div>
                <div className="text-sm text-gray-500">€{(statisticsData.average / BGN_TO_EUR_RATE).toFixed(2)}</div>
            </CardContent>
          </Card>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filterCategory && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setFilterCategory('')}
            >
              Clear filter
            </Button>
          )}
        </div>

        {/* Expenses by Month */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">📋 Expenses by Month</h2>
          
            {loading ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2">Loading expenses...</p>
              </div>
              </CardContent>
            </Card>
          ) : filteredAndSortedExpenses.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-gray-500">
                No expenses found for the selected filter.
              </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sortedMonths.map((monthKey) => {
                const monthExpenses = groupedExpenses.get(monthKey)!
                const monthTotal = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
                const isExpanded = expandedMonths.has(monthKey)
                
                const isSelected = selectedMonth === monthKey
                const showAsSelected = isSelected && isExpanded // Only show blue when both selected AND expanded
                
                return (
                  <Card key={monthKey} className={`overflow-hidden transition-all duration-200 ${
                    showAsSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
                  }`}>
                    <CardHeader 
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        toggleMonth(monthKey)
                        // Always select month when clicking (for summary stats)
                        handleMonthSelect(monthKey)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                            <ChevronRight className={`h-5 w-5 transition-colors ${
                              showAsSelected ? 'text-blue-500' : 'text-gray-500'
                            }`} />
                          </div>
                          <div>
                            <CardTitle className={`text-sm sm:text-lg transition-colors ${
                              showAsSelected ? 'text-blue-700' : ''
                            }`}>
                              {formatMonthDisplay(monthKey)}
                            </CardTitle>
                            <p className="text-xs sm:text-sm text-gray-600">{monthExpenses.length} transactions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg sm:text-xl font-bold transition-colors ${
                            showAsSelected ? 'text-blue-700' : 'text-gray-900'
                          }`}>
                            {monthTotal.toFixed(2)} лв
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">€{(monthTotal / BGN_TO_EUR_RATE).toFixed(2)}</div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {isExpanded && (
                      <CardContent className="pt-0 space-y-6">
                        {/* Category Breakdown Section */}
                        <div className="space-y-3">
                          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            📊 Category Breakdown
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {getCategoryBreakdown(monthExpenses).map((item) => (
                              <div 
                                key={item.category} 
                                className="p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <Badge className={`${getCategoryColor(item.category)} text-xs font-medium`}>
                                    {item.category}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {item.count} {item.count === 1 ? 'expense' : 'expenses'}
                                  </span>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex items-baseline justify-between">
                                    <span className="text-lg font-bold text-gray-900">
                                      {item.total.toFixed(2)} лв
                                    </span>
                                    <span className="text-sm font-medium text-gray-600">
                                      {item.percentage.toFixed(1)}%
                                    </span>
                                  </div>
                                  
                                  <div className="text-xs text-gray-500">
                                    €{(item.total / BGN_TO_EUR_RATE).toFixed(2)}
                                  </div>
                                  
                                  {/* Progress Bar */}
                                  <div className="w-full bg-gray-200 rounded-full h-4">
                                    <div 
                                      className={`h-4 rounded-full transition-all duration-300 shadow-sm ${
                                        item.category === 'Food' ? 'bg-green-600' :
                                        item.category === 'Entertainment' ? 'bg-red-600' :
                                        item.category === 'Gas' ? 'bg-yellow-600' :
                                        item.category === 'Planned' ? 'bg-blue-600' :
                                        item.category === 'Car' ? 'bg-purple-600' :
                                        item.category === 'Fitness' ? 'bg-emerald-600' :
                                        item.category === 'Clothes' ? 'bg-yellow-500' :
                                        item.category === 'Necessary' ? 'bg-orange-600' :
                                        item.category === 'Barber' ? 'bg-gray-600' :
                                        'bg-gray-600'
                                      }`}
                                      style={{ width: `${item.percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Expense List */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                                <th className="py-3 px-4">
                                  <button 
                                    onClick={() => handleSort('description')}
                                    className="flex items-center gap-2 font-medium text-gray-900 hover:text-gray-700 transition-colors"
                                  >
                                    Description
                                    {getSortIcon('description')}
                                  </button>
                                </th>
                                <th className="py-3 px-4">
                                  <button 
                                    onClick={() => handleSort('category')}
                                    className="flex items-center gap-2 font-medium text-gray-900 hover:text-gray-700 transition-colors"
                                  >
                                    Category
                                    {getSortIcon('category')}
                                  </button>
                                </th>
                                <th className="py-3 px-4">
                                  <button 
                                    onClick={() => handleSort('date')}
                                    className="flex items-center gap-2 font-medium text-gray-900 hover:text-gray-700 transition-colors"
                                  >
                                    Date
                                    {getSortIcon('date')}
                                  </button>
                                </th>
                                <th className="py-3 px-4">
                                  <button 
                                    onClick={() => handleSort('amount')}
                                    className="flex items-center gap-2 font-medium text-gray-900 hover:text-gray-700 transition-colors ml-auto"
                                  >
                                    Amount
                                    {getSortIcon('amount')}
                                  </button>
                                </th>
                      <th className="w-12 py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                              {monthExpenses.map((expense) => (
                      <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{expense.description}</div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={getCategoryColor(expense.category)}>
                            {expense.category}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-gray-600">{expense.date}</div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="font-bold text-gray-900">{expense.amount.toFixed(2)} лв</div>
                          <div className="text-sm text-gray-500">€{(expense.amount / BGN_TO_EUR_RATE).toFixed(2)}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button 
                              className="text-blue-600 hover:text-blue-800 p-1"
                              onClick={() => {
                                console.log('EDIT CLICKED for expense:', expense.id)
                                openEditDialog(expense)
                              }}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              className="text-green-600 hover:text-green-800 p-1"
                              onClick={() => {
                                console.log('DUPLICATE CLICKED for expense:', expense.id)
                                handleDuplicateExpense(expense.id)
                              }}
                              title="Duplicate"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-800 p-1"
                              onClick={() => {
                                console.log('DELETE CLICKED for expense:', expense.id)
                                handleDeleteExpense(expense.id)
                              }}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          </CardContent>
                    )}
        </Card>
                )
              })}
            </div>
          )}
        </div>
              </div>
            )}
            
            {currentPage === 'settings' && <SettingsPage />}
            {currentPage === 'charts' && <ChartsPage expenses={expenses} />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return <ExpenseTracker />
}
