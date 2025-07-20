# Complete Supabase Database Setup for Azumah Websites

## 🚀 Quick Setup Instructions

1. **Create a new Supabase project** at https://supabase.com
2. **Go to SQL Editor** in your Supabase dashboard
3. **Copy and paste each SQL block below** in order
4. **Run each block separately** to ensure proper setup

---

## 📋 Table of Contents

1. [Core Tables](#1-core-tables)
2. [Row Level Security (RLS) Policies](#2-row-level-security-rls-policies)
3. [Indexes for Performance](#3-indexes-for-performance)
4. [Functions and Triggers](#4-functions-and-triggers)
5. [Sample Data (Optional)](#5-sample-data-optional)
6. [Environment Variables](#6-environment-variables)

---

## 1. Core Tables

### 1.1 Profiles Table
```sql
-- Create profiles table for user management
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  full_name TEXT,
  phone TEXT,
  address TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index on email
CREATE UNIQUE INDEX profiles_email_idx ON profiles(email);
```

### 1.2 Properties Table
```sql
-- Create properties table for real estate listings
CREATE TABLE properties (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  image TEXT NOT NULL,
  beds INTEGER NOT NULL DEFAULT 1,
  baths INTEGER NOT NULL DEFAULT 1,
  sqft INTEGER NOT NULL DEFAULT 500,
  type TEXT DEFAULT 'Apartment' CHECK (type IN ('Apartment', 'House')),
  tag TEXT NOT NULL CHECK (tag IN ('For Sale', 'For Rent')),
  rating DECIMAL(2,1) DEFAULT 4.5 CHECK (rating >= 0 AND rating <= 5),
  isPopular BOOLEAN DEFAULT FALSE,
  isNew BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX properties_location_idx ON properties(location);
CREATE INDEX properties_type_idx ON properties(type);
CREATE INDEX properties_tag_idx ON properties(tag);
CREATE INDEX properties_price_idx ON properties(price);
CREATE INDEX properties_user_id_idx ON properties(user_id);
CREATE INDEX properties_created_at_idx ON properties(created_at DESC);
```

### 1.3 User Favorites Table
```sql
-- Create user_favorites table for favorite properties
CREATE TABLE user_favorites (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- Create indexes
CREATE INDEX user_favorites_user_id_idx ON user_favorites(user_id);
CREATE INDEX user_favorites_property_id_idx ON user_favorites(property_id);
```

### 1.4 Cart Items Table
```sql
-- Create cart_items table for shopping cart functionality
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- Create indexes
CREATE INDEX cart_items_user_id_idx ON cart_items(user_id);
CREATE INDEX cart_items_property_id_idx ON cart_items(property_id);
```

### 1.5 Blogs Table (Optional - for future blog functionality)
```sql
-- Create blogs table for blog posts
CREATE TABLE blogs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  image TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  published BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  slug TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX blogs_author_id_idx ON blogs(author_id);
CREATE INDEX blogs_published_idx ON blogs(published);
CREATE INDEX blogs_slug_idx ON blogs(slug);
CREATE INDEX blogs_created_at_idx ON blogs(created_at DESC);
```

---

## 2. Row Level Security (RLS) Policies

### 2.1 Enable RLS on All Tables
```sql
-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
```

### 2.2 Profiles Table Policies
```sql
-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to update user roles
CREATE POLICY "Admins can update user roles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 2.3 Properties Table Policies
```sql
-- Properties policies
CREATE POLICY "Anyone can view published properties" ON properties
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own properties" ON properties
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own properties" ON properties
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own properties" ON properties
  FOR DELETE USING (auth.uid() = user_id);

-- Allow admins to manage all properties
CREATE POLICY "Admins can manage all properties" ON properties
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 2.4 User Favorites Policies
```sql
-- User favorites policies
CREATE POLICY "Users can view their own favorites" ON user_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON user_favorites
  FOR DELETE USING (auth.uid() = user_id);
```

### 2.5 Cart Items Policies
```sql
-- Cart items policies
CREATE POLICY "Users can view their own cart items" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" ON cart_items
  FOR DELETE USING (auth.uid() = user_id);
```

### 2.6 Blogs Policies
```sql
-- Blogs policies
CREATE POLICY "Anyone can view published blogs" ON blogs
  FOR SELECT USING (published = true);

CREATE POLICY "Authors can view their own blogs" ON blogs
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Authors can insert their own blogs" ON blogs
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own blogs" ON blogs
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own blogs" ON blogs
  FOR DELETE USING (auth.uid() = author_id);

-- Allow admins to manage all blogs
CREATE POLICY "Admins can manage all blogs" ON blogs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## 3. Indexes for Performance

```sql
-- Additional performance indexes
CREATE INDEX properties_popular_idx ON properties(isPopular) WHERE isPopular = true;
CREATE INDEX properties_new_idx ON properties(isNew) WHERE isNew = true;
CREATE INDEX properties_price_range_idx ON properties(price, tag);
CREATE INDEX properties_location_type_idx ON properties(location, type);

-- Full-text search indexes
CREATE INDEX properties_search_idx ON properties 
  USING gin(to_tsvector('english', title || ' ' || description || ' ' || location));

CREATE INDEX blogs_search_idx ON blogs 
  USING gin(to_tsvector('english', title || ' ' || content));
```

---

## 4. Functions and Triggers

### 4.1 Updated At Trigger Function
```sql
-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at 
  BEFORE UPDATE ON properties 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at 
  BEFORE UPDATE ON cart_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blogs_updated_at 
  BEFORE UPDATE ON blogs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4.2 Auto-create Profile Function
```sql
-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    CASE 
      WHEN new.email IN ('iodeenoxide@gmail.com', 'oideenz4@gmail.com', 'azumahhomes@gmail.com') THEN 'admin'
      ELSE 'user'
    END,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    NOW(),
    NOW()
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- Drop existing trigger if it exists, then create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger to call the function when a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 4.3 Search Function
```sql
-- Function for advanced property search
CREATE OR REPLACE FUNCTION search_properties(
  search_term TEXT DEFAULT '',
  property_type TEXT DEFAULT '',
  property_tag TEXT DEFAULT '',
  min_price DECIMAL DEFAULT 0,
  max_price DECIMAL DEFAULT 999999999,
  location_filter TEXT DEFAULT ''
)
RETURNS TABLE (
  id INTEGER,
  title TEXT,
  description TEXT,
  location TEXT,
  price DECIMAL,
  image TEXT,
  beds INTEGER,
  baths INTEGER,
  sqft INTEGER,
  type TEXT,
  tag TEXT,
  rating DECIMAL,
  isPopular BOOLEAN,
  isNew BOOLEAN,
  created_at TIMESTAMPTZ,
  user_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.title, p.description, p.location, p.price, p.image,
         p.beds, p.baths, p.sqft, p.type, p.tag, p.rating,
         p.isPopular, p.isNew, p.created_at, p.user_id
  FROM properties p
  WHERE 
    (search_term = '' OR 
     p.title ILIKE '%' || search_term || '%' OR 
     p.description ILIKE '%' || search_term || '%' OR
     p.location ILIKE '%' || search_term || '%')
    AND (property_type = '' OR p.type = property_type)
    AND (property_tag = '' OR p.tag = property_tag)
    AND p.price >= min_price
    AND p.price <= max_price
    AND (location_filter = '' OR p.location ILIKE '%' || location_filter || '%')
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;
```

---

## 5. Sample Data (Optional)

### 5.1 Sample Properties
```sql
-- Insert sample properties (run only if you want demo data)
INSERT INTO properties (title, description, location, price, image, beds, baths, sqft, type, tag, rating, isPopular, isNew, user_id) VALUES
('Modern Apartment in Accra', 'Beautiful 2-bedroom apartment with modern amenities in the heart of Accra', 'Accra, Ghana', 150000.00, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 2, 2, 1200, 'Apartment', 'For Sale', 4.8, true, true, (SELECT id FROM auth.users LIMIT 1)),
('Luxury Villa in Kumasi', 'Spacious 4-bedroom villa with garden and swimming pool', 'Kumasi, Ghana', 85000.00, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', 4, 3, 2500, 'House', 'For Rent', 4.9, true, false, (SELECT id FROM auth.users LIMIT 1)),
('Cozy Studio Apartment', 'Perfect for young professionals, fully furnished studio', 'Tema, Ghana', 45000.00, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 1, 1, 600, 'Apartment', 'For Rent', 4.5, false, true, (SELECT id FROM auth.users LIMIT 1)),
('Family House with Garden', 'Spacious family home with large garden and garage', 'Cape Coast, Ghana', 120000.00, 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800', 3, 2, 1800, 'House', 'For Sale', 4.7, false, false, (SELECT id FROM auth.users LIMIT 1));
```

### 5.2 Sample Blog Posts
```sql
-- Insert sample blog posts (optional)
INSERT INTO blogs (title, content, excerpt, image, author_id, published, featured, slug) VALUES
('Top 10 Real Estate Investment Tips', 'Comprehensive guide to real estate investment in Ghana...', 'Learn the best strategies for real estate investment', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800', (SELECT id FROM auth.users LIMIT 1), true, true, 'top-10-real-estate-investment-tips'),
('Understanding Property Valuation', 'How to properly value properties in the Ghanaian market...', 'Master the art of property valuation', 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=800', (SELECT id FROM auth.users LIMIT 1), true, false, 'understanding-property-valuation');
```

---

## 6. Environment Variables

After setting up your database, update your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_DEBUG=false
```

---

## 🔧 Post-Setup Verification

### Test Database Connection
```sql
-- Run this to verify everything is working
SELECT 
  'profiles' as table_name, count(*) as row_count FROM profiles
UNION ALL
SELECT 
  'properties' as table_name, count(*) as row_count FROM properties
UNION ALL
SELECT 
  'user_favorites' as table_name, count(*) as row_count FROM user_favorites
UNION ALL
SELECT 
  'cart_items' as table_name, count(*) as row_count FROM cart_items
UNION ALL
SELECT 
  'blogs' as table_name, count(*) as row_count FROM blogs;
```

### Test RLS Policies
```sql
-- Test that RLS is working (should return policy information)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

---

## 🚨 Important Notes

1. **Admin Setup**: Your email `iodeenoxide@gmail.com` is automatically set as admin in the trigger function
2. **Security**: All tables have proper RLS policies for data protection
3. **Performance**: Indexes are optimized for common queries
4. **Scalability**: Schema supports future features like blogs and advanced search
5. **Backup**: Always backup your database before making changes

---

## 🆘 Troubleshooting

If you encounter issues:

1. **Check Supabase logs** in the dashboard
2. **Verify environment variables** are correct
3. **Test authentication** with a simple signup/login
4. **Check RLS policies** if data access fails
5. **Review indexes** if queries are slow

Your Azumah Websites application should now be fully functional with this database setup!