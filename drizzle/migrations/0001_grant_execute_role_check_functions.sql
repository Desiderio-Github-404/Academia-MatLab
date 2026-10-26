GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_course_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated, anon;