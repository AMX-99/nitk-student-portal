-- Run this in your Supabase SQL Editor to add the missing columns
ALTER TABLE public.timetable_slots 
ADD COLUMN IF NOT EXISTS slot_type text DEFAULT 'lecture',
ADD COLUMN IF NOT EXISTS department_id integer REFERENCES public.departments(id);
