export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm">
        <h2 className="text-3xl font-semibold mb-8 text-center">Sign in to EduCore</h2>
        
        <form className="space-y-4">
          <input type="email" placeholder="Email" className="w-full border p-3 rounded-2xl" />
          <input type="password" placeholder="Password" className="w-full border p-3 rounded-2xl" />
          <button className="w-full btn btn-primary py-3">Sign in</button>
        </form>
        
        <p className="text-center text-sm mt-6 text-zinc-500">
          Don't have an account? <a href="/signup" className="text-[#0A66C2]">Sign up</a>
        </p>
      </div>
    </div>
  );
}
