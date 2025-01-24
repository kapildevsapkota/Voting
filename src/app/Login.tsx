"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";  
import { useToast } from "@/hooks/use-toast";

// Define the validation schema
const loginSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .trim(),
  number: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must not exceed 15 digits")
    .regex(/^\+?[0-9]+$/, "Invalid phone number format")
    .trim()
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const router = useRouter();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      name: "",
      number: ""
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Store data in local storage
      localStorage.setItem("user", JSON.stringify(data));
      
      toast({
        title: "Success",
        description: "Login successful! Redirecting...",
      });
      
      // Redirect to the dashboard
      router.push("/");
    } catch {
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-lg shadow-md w-96 space-y-4"
      >
        <p className="text-sm text-gray-600 mb-2">Please enter your credentials to log in.</p>
        <p className="text-sm text-gray-600 mb-2">Welcome to our application!</p>
        <h2 className="text-2xl font-semibold mb-4">Login</h2>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">Name</label>
          <input
            {...register("name")}
            type="text"
            placeholder="Enter your name"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Phone Number</label>
          <input
            {...register("number")}
            type="tel"
            placeholder="Enter your phone number"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.number && (
            <p className="text-red-500 text-sm">{errors.number.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
