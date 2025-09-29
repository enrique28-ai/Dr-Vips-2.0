import { useState } from "react";
import { User, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore.js";
import AuthShell from "../../components/forms/AuthShell.jsx";
import Input from "../../components/forms/Input.jsx";
import PasswordStrengthMeter from "../../components/forms/PasswordStrengthMeter.jsx";
import { toast } from "react-hot-toast";
import Button from "../../components/forms/Button.jsx";
import { isStrongPassword } from "../../lib/password.js";


export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signup, isLoading } = useAuthStore();
  const strong = isStrongPassword(password);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!strong) {
     toast.error("Password must meet all requirements.");
     return;
   }
    try {
      await signup(name, email, password); // orden correcto
      navigate("/verify-email");
    } catch {}
  };

  return (
    <AuthShell title="Create account">
      <form onSubmit={handleSignUp}>
        <Input label="Username" icon={User} type="text" placeholder="yourname"
               value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Email" icon={Mail} type="email" placeholder="you@example.com"
               value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Password" icon={Lock} type="password" placeholder="••••••••"
               value={password} onChange={(e) => setPassword(e.target.value)} required />

        <p className="text-xs text-gray-500 -mt-3 mb-2">Minimum 6 characters.</p>
        <PasswordStrengthMeter password={password} />

        <Button className="mt-4 cursor-pointer" type="submit" loading={isLoading} disabled={!strong || isLoading}>Register</Button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">Log in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
