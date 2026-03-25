const Pagination = ({ page, totalPages, onPageChange }) => {
  const getPages = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">

      {/* PREVIOUS */}
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className={`px-4 py-2 rounded-xl border transition text-sm font-medium
          ${
            page === 1
              ? "opacity-40 cursor-not-allowed border-border bg-card text-muted"
              : "border-border bg-card text-text hover:bg-background hover:border-primary"
          }`}
      >
        ← Prev
      </button>

      {/* PAGE NUMBERS */}
      {getPages().map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-10 h-10 rounded-xl border text-sm font-medium transition
            ${
              page === p
                ? "bg-primary text-white border-primary shadow-md scale-105"
                : "bg-card border-border text-text hover:bg-background hover:border-primary"
            }`}
        >
          {p}
        </button>
      ))}

      {/* NEXT */}
      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className={`px-4 py-2 rounded-xl border transition text-sm font-medium
          ${
            page === totalPages
              ? "opacity-40 cursor-not-allowed border-border bg-card text-muted"
              : "border-border bg-card text-text hover:bg-background hover:border-primary"
          }`}
      >
        Next →
      </button>

    </div>
  );
};

export default Pagination;