import Link from "next/link";

export default function LoginPage() {
  return (
    <div>
        <h1>Login</h1>
      <form>
        <label>Username or Email:</label> <br />
        <input /> <br />
        <label>Password:</label> <br />
        <input /> <br />
        <button>Login</button>
      </form>
      <Link href="/Register">You don't have an account?</Link>
   
    </div>
  );
}
