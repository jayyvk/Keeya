
-- Create a function to decrement a user's credits
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
    -- Get current balance
    SELECT credits_balance INTO current_balance
    FROM public.user_credits
    WHERE user_id = p_user_id;
    
    -- Check if user has enough credits
    IF current_balance IS NULL THEN
        RAISE EXCEPTION 'User credits record not found';
    END IF;
    
    IF current_balance < p_credits THEN
        RAISE EXCEPTION 'Insufficient credits: % available, % required', current_balance, p_credits;
    END IF;
    
    -- Update the credit balance
    UPDATE public.user_credits
    SET 
        credits_balance = credits_balance - p_credits,
        updated_at = now()
    WHERE user_id = p_user_id;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;
