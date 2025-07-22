// app/brochure/page.tsx
import Link from 'next/link';

const brochures = [
  {
    title: "UI Flow",
    description: "A Complete UI/UX Design Guide — Go-to Toolkit with 80 Prompts for Every Stage of Your Design Journey.",
    file: "/docs/UI Flow.pdf",
  },
];

export default function BrochurePage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">📘 Arewa Skill Library</h1>
      <div className="grid gap-6">
        {brochures.map((doc, index) => (
          <article
            key={index}
            className="p-6 bg-white border shadow-sm rounded-lg hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold text-gray-800">{doc.title}</h2>
            <p className="text-gray-600 mt-2 mb-4">{doc.description}</p>
            <Link
              href={doc.file}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              📥 View / Download PDF
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
