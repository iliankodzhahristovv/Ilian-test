-- Add user_id column to expenses table
ALTER TABLE expenses ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_expenses_user_id ON expenses(user_id);

-- Update Row Level Security policies
DROP POLICY IF EXISTS "Allow all operations on expenses" ON expenses;

-- Create policy to allow users to see only their own expenses
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own expenses
CREATE POLICY "Users can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own expenses
CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own expenses
CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Optional: Migrate existing expenses to a default user (if any exist)
-- Replace 'YOUR_USER_ID_HERE' with an actual user ID from auth.users if you want to keep existing data
-- UPDATE expenses SET user_id = 'YOUR_USER_ID_HERE' WHERE user_id IS NULL;
