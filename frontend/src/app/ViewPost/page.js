// src/app/ViewPost/page.js
"use client";

import { Suspense } from "react";
import ViewPostContent from "./ViewPostContent";   // ← نضيف هذا الملف تحت نفس المجلد

export default function ViewPostPage() {
  return (
    <Suspense fallback={<p>Loading post...</p>}>
      <ViewPostContent />
    </Suspense>
  );
}
