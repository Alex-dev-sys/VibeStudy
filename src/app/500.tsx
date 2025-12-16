export default function Custom500() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#1a0a1a]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-white/80 mb-4">
          Ошибка сервера
        </h2>
        <p className="text-white/60 mb-8">
          Что-то пошло не так. Попробуйте обновить страницу.
        </p>
        <a
          href="/"
          className="inline-block rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-white font-medium transition-transform hover:scale-105"
        >
          Вернуться на главную
        </a>
      </div>
    </div>
  );
}
