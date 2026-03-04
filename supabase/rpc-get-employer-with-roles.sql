-- RPC function to get employer details and roles for coffee chat detail view
-- Uses SECURITY DEFINER to bypass RLS safely

CREATE OR REPLACE FUNCTION get_employer_with_roles(employer_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'employer', (
      SELECT json_build_object(
        'id', e.id,
        'company_name', e.company_name,
        'description', e.description,
        'industry', e.industry,
        'company_size', e.company_size,
        'location', e.location,
        'company_website', e.company_website,
        'culture_values', e.culture_values,
        'openness_preference', e.openness_preference,
        'conscientiousness_preference', e.conscientiousness_preference,
        'extraversion_preference', e.extraversion_preference,
        'agreeableness_preference', e.agreeableness_preference,
        'neuroticism_preference', e.neuroticism_preference
      )
      FROM employers e
      WHERE e.id = employer_uuid
    ),
    'roles', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id', r.id,
          'title', r.title,
          'description', r.description,
          'location', r.location,
          'work_style', r.work_style,
          'employment_type', r.employment_type,
          'salary_min', r.salary_min,
          'salary_max', r.salary_max
        )
        ORDER BY r.created_at DESC
      ), '[]'::json)
      FROM roles r
      WHERE r.employer_id = employer_uuid
        AND r.status = 'active'
    )
  ) INTO result;

  RETURN result;
END;
$$;
