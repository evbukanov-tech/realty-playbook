export default function ContactsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight">Контакты</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        По вопросам работы ProStore напишите на{" "}
        <a
          href="mailto:support@prostore.app"
          className="text-primary underline-offset-4 hover:underline"
        >
          support@prostore.app
        </a>
        .
      </p>
    </div>
  );
}
