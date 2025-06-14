import Link from "next/link";

export default function RegisterPage(){
    return (
        <div>
        <h1>Register</h1>
      <form>
        <label>First name:</label> <br />
        <input /> <br />
        <label>Lasr name:</label> <br />
        <input /> <br />
        <label>Nickname:</label> <br />
        <input /> <br />
        <label>Email:</label> <br />
        <input /> <br />
        <label>Date of Birth:</label> <br />
        <input /> <br />
        <label>Password:</label> <br />
        <input /> <br />
        <label>Password Confirm:</label> <br />
        <input /> <br />
        {/* Avatar will adding later */}
        <button>Register</button>
      </form>
      <Link href="/Login">You have already an account?</Link>
    </div>
    )
}