import { supabase } from './supabase'
import type { Expense } from './supabase'

// Get user's expenses
export async function getExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching expenses:', error)
    return []
  }

  return data || []
}

// Add new expense
export async function addExpense(expense: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Expense | null> {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Error getting user:', userError)
      return null
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert([{ ...expense, user_id: user.id }])
      .select()
      .single()

    if (error) {
      console.error('Error adding expense:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('addExpense failed:', error)
    return null
  }
}

// Update expense
export async function updateExpense(id: string, updates: Partial<Expense>): Promise<Expense | null> {
  try {
    // Remove user_id from updates to prevent modification
    const { user_id, ...safeUpdates } = updates

    const { data, error } = await supabase
      .from('expenses')
      .update(safeUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating expense:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('updateExpense failed:', error)
    return null
  }
}

// Delete expense
export async function deleteExpense(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting expense:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('deleteExpense failed:', error)
    return false
  }
}
