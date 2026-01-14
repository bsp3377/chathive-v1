"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Loader2, Building2 } from "lucide-react";

export default function SignupPage() {
    const [businessName, setBusinessName] = useState("");
    const [businessType, setBusinessType] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Create the auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        business_name: businessName,
                    },
                },
            });

            if (authError) {
                setError(authError.message);
                return;
            }

            if (!authData.user) {
                setError("Failed to create user");
                return;
            }

            // 2. Create the organization
            const slug = generateSlug(businessName) + "-" + Math.random().toString(36).substring(2, 6);
            const { data: orgData, error: orgError } = await supabase
                .from("organizations")
                .insert({
                    name: businessName,
                    slug,
                    business_type: businessType,
                })
                .select()
                .single();

            if (orgError) {
                console.error("Org creation error:", orgError);
                setError("Failed to create organization");
                return;
            }

            // 3. Create the user profile
            const { error: profileError } = await supabase
                .from("users")
                .insert({
                    id: authData.user.id,
                    org_id: orgData.id,
                    email,
                    full_name: fullName,
                    role: "owner",
                });

            if (profileError) {
                console.error("Profile creation error:", profileError);
                setError("Failed to create user profile");
                return;
            }

            // Success!
            setSuccess(true);
            setTimeout(() => {
                router.push("/dashboard");
                router.refresh();
            }, 1500);
        } catch (err) {
            console.error("Signup error:", err);
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
                <CardContent className="pt-8 pb-8 text-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto">
                        <MessageSquare className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Account Created!</h2>
                    <p className="text-slate-300">Redirecting to your dashboard...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
            <CardHeader className="text-center space-y-2">
                <div className="flex justify-center mb-2">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                        <MessageSquare className="h-8 w-8 text-white" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold text-white">
                    Create your account
                </CardTitle>
                <CardDescription className="text-slate-300">
                    Start managing your business with ChatHive
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSignup}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Business Info */}
                    <div className="space-y-2">
                        <Label htmlFor="businessName" className="text-slate-200 flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Business Name
                        </Label>
                        <Input
                            id="businessName"
                            placeholder="Your Business Name"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            required
                            className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-emerald-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="businessType" className="text-slate-200">
                            Business Type
                        </Label>
                        <Select value={businessType} onValueChange={setBusinessType}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-emerald-500">
                                <SelectValue placeholder="Select your business type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="salon">Salon & Spa</SelectItem>
                                <SelectItem value="clinic">Clinic</SelectItem>
                                <SelectItem value="gym">Gym & Fitness</SelectItem>
                                <SelectItem value="restaurant">Restaurant</SelectItem>
                                <SelectItem value="retail">Retail Store</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="border-t border-white/10 pt-4 mt-4" />

                    {/* Personal Info */}
                    <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-slate-200">
                            Your Full Name
                        </Label>
                        <Input
                            id="fullName"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-emerald-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-200">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-emerald-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-200">
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-emerald-500"
                        />
                        <p className="text-xs text-slate-400">Minimum 6 characters</p>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            "Create Account"
                        )}
                    </Button>
                    <p className="text-sm text-slate-400 text-center">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-emerald-400 hover:text-emerald-300 font-medium"
                        >
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}
