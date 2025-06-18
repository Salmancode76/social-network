"use client";

export function Internal505() {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Oops! Something went wrong.</h1>
      <p>We encountered an unexpected error. Please try again later.</p>
      <button onClick={() => window.location.reload()}>Try again</button>
    </div>
  );
}

export function Lost404() {
  return (
    <>
      <div>The page you are looking for does not exist or got deleted.</div>
    </>
  );
}
