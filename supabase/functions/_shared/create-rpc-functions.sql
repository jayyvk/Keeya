
-- Function to decrement user credits safely
CREATE OR REPLACE FUNCTION public.decrement_user_credits(
  p_user_id UUID,
  p_credits INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Get current credit balance
  SELECT credits_balance INTO current_balance
  FROM public.user_credits
  WHERE user_id = p_user_id;
  
  -- Check if user has enough credits
  IF current_balance IS NULL OR current_balance < p_credits THEN
    RETURN FALSE;
  END IF;
  
  -- Update credit balance
  UPDATE public.user_credits
  SET 
    credits_balance = credits_balance - p_credits,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$$;

-- Function to add credits (for payments)
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id UUID,
  p_credits INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  -- Check if user exists
  SELECT EXISTS (
    SELECT 1 FROM public.user_credits WHERE user_id = p_user_id
  ) INTO user_exists;
  
  IF user_exists THEN
    -- Update existing user
    UPDATE public.user_credits
    SET 
      credits_balance = credits_balance + p_credits,
      updated_at = now()
    WHERE user_id = p_user_id;
  ELSE
    -- Insert new user
    INSERT INTO public.user_credits (user_id, credits_balance)
    VALUES (p_user_id, p_credits);
  END IF;
  
  RETURN TRUE;
END;
$$;
