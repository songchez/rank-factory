import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { NeoButton } from "./neo-button";
import type { User } from "@supabase/supabase-js";

interface UserMenuProps {
  user: User;
}

export function UserMenu({ user }: UserMenuProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="flex items-center gap-4">
      <span className="hidden md:inline-block font-bold text-sm truncate max-w-[150px]">{user.email}</span>
      <NeoButton variant="secondary" size="sm" onClick={handleLogout} className="text-xs px-3 h-8">
        로그아웃
      </NeoButton>
    </div>
  );
}
