"use client";

import { Suspense } from "react";
import ViewPostContent from "./ViewPostContent"; 

export default function ViewPostPage() {
  return (
    <Suspense fallback={<p>Loading post...</p>}>
      <ViewPostContent />
    </Suspense>
  );
}
