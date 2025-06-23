// 📄 Page: /dashboard/feedback

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ClientLayout from "@/app/ClientLayout";
import { getUserFromCookies } from "@/lib/auth";

export default function FeedbackPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message, rating }),
    });

    if (res.ok) {
      setSubmitted(true);
      setSubject("");
      setMessage("");
      setRating("");
    } else {
      alert("Failed to submit feedback");
    }
  };

  return (
    <ClientLayout>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">💬 Submit Feedback</h1>

        {submitted ? (
          <div className="bg-green-100 border border-green-400 text-green-700 p-4 rounded">
            Thank you! Your feedback has been submitted.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <input
                className="w-full border px-3 py-2 rounded"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                className="w-full border px-3 py-2 rounded"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Rating (Optional)</label>
              <select
                className="w-full border px-3 py-2 rounded"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              >
                <option value="">No Rating</option>
                <option value="👍">👍 Good</option>
                <option value="😐">😐 Okay</option>
                <option value="👎">👎 Needs Improvement</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Submit Feedback
            </button>
          </form>
        )}
      </div>
    </ClientLayout>
  );
}
