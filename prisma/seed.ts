import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  await prisma.news.deleteMany()
  await prisma.author.deleteMany()

  const authors = await prisma.author.createMany({
    data: [
      { name: 'Stefan', email: 'stefan@test.is' },
      { name: 'Anna', email: 'anna@test.is' },
      { name: 'Jon', email: 'jon@test.is' },
      { name: 'Sara', email: 'sara@test.is' },
    ],
  })

  // Nota findMany til að fá ids (createMany skilar ekki records í postgres á einfaldan hátt)
  const createdAuthors = await prisma.author.findMany({ orderBy: { id: 'asc' } })

  const pickAuthorId = (i: number): number => createdAuthors[i % createdAuthors.length]!.id

  const makeSlug = (s: string): string =>
    s
      .trim()
      .toLowerCase()
      .replaceAll(/[^a-z0-9\s-]/g, '')
      .replaceAll(/\s+/g, '-')
      .replaceAll(/-+/g, '-')

  const newsData = Array.from({ length: 11 }, (_, i) => {
    const n = i + 1
    const title = `Bull frétt ${n}`
    return {
      title,
      slug: makeSlug(title),
      excerpt: `Útdráttur fyrir frétt ${n}.`,
      content: `Efni fyrir frétt ${n}. Lorem ipsum dolor sit amet.`,
      published: n % 2 === 0,
      authorId: pickAuthorId(i),
    }
  })

  await prisma.news.createMany({ data: newsData })

  console.log('Seed complete')
  console.log({ authorsCreated: authors.count, newsCreated: newsData.length })
}

main()
  .catch((e: unknown) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })