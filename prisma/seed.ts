// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const topics = [
  { name: 'Airflow', slug: 'airflow', color: '#017CEE' },
  { name: 'SQL', slug: 'sql', color: '#336791' },
  { name: 'Kafka', slug: 'kafka', color: '#231F20' },
  { name: 'Python', slug: 'python', color: '#3776AB' },
  { name: 'dbt', slug: 'dbt', color: '#FF694B' },
  { name: 'Spark', slug: 'spark', color: '#E25A1C' },
  { name: 'Docker', slug: 'docker', color: '#2496ED' },
  { name: 'Data Modeling', slug: 'data-modeling', color: '#7C3AED' },
  { name: 'Architecture', slug: 'architecture', color: '#059669' },
  { name: 'ETL', slug: 'etl', color: '#D97706' },
]

const samplePost = {
  title: 'Медальонная архитектура: зачем нужны Bronze, Silver и Gold',
  slug: 'medallion-architecture',
  excerpt: 'Bronze, Silver, Gold — не просто модные слова. Разбираем, зачем нужна медальонная архитектура в Data Engineering и как она помогает строить надёжные пайплайны.',
  content: `# Медальонная архитектура: зачем нужны Bronze, Silver и Gold

Если вы хоть раз работали с данными в продакшене, вы знаете эту боль: сырые данные прилетают в разных форматах, с дубликатами, с NULL там, где их быть не должно. Медальонная архитектура — это паттерн, который помогает это победить.

## Что такое медальонная архитектура?

Это подход к организации данных в три слоя:

- **Bronze** — сырые данные as-is, без трансформаций
- **Silver** — очищенные, дедуплицированные, нормализованные данные
- **Gold** — бизнес-агрегаты, готовые для аналитики и дашбордов

\`\`\`python
# Пример: загрузка в Bronze слой
def load_to_bronze(source_df: DataFrame, table_name: str) -> None:
    """
    Загружаем данные as-is, добавляем только технические поля
    """
    source_df \\
        .withColumn("_loaded_at", current_timestamp()) \\
        .withColumn("_source", lit(table_name)) \\
        .write \\
        .mode("append") \\
        .saveAsTable(f"bronze.{table_name}")
\`\`\`

## Почему это работает?

Главный принцип — **immutability на Bronze слое**. Вы никогда не изменяете сырые данные. Это значит, что при ошибке трансформации вы всегда можете перезапустить пайплайн с нуля.

### Bronze → Silver: основные трансформации

\`\`\`sql
-- Дедупликация с сохранением последней версии записи
CREATE OR REPLACE TABLE silver.orders AS
SELECT * EXCEPT (row_num)
FROM (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY order_id
      ORDER BY _loaded_at DESC
    ) as row_num
  FROM bronze.orders
)
WHERE row_num = 1
  AND order_id IS NOT NULL  -- убираем невалидные записи
\`\`\`

### Silver → Gold: бизнес-агрегаты

\`\`\`sql
-- Витрина продаж по дням
CREATE OR REPLACE TABLE gold.daily_sales AS
SELECT
  DATE(created_at) as date,
  COUNT(DISTINCT order_id) as orders_count,
  SUM(amount) as revenue,
  AVG(amount) as avg_order_value
FROM silver.orders
WHERE status = 'completed'
GROUP BY 1
ORDER BY 1
\`\`\`

## Когда стоит использовать?

Медальонная архитектура оправдывает себя, когда:

1. У вас несколько источников данных с разными схемами
2. Данные приходят с задержкой или дубликатами
3. Разные команды потребляют данные на разных уровнях зрелости
4. Важна воспроизводимость и возможность reprocessing

Для маленьких команд и простых пайплайнов — это может быть overkill. Но как только данных становится больше, структура себя окупает.

## Итог

Медальонная архитектура — не серебряная пуля, но отличный фундамент для построения надёжного Data Platform. Начните с Bronze/Silver, добавьте Gold когда появятся реальные потребители данных.

В следующей статье разберём, как реализовать это на Apache Airflow с автоматическим мониторингом качества данных.`,
}

async function main() {
  console.log('🌱 Seeding database...')

  // Upsert topics
  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { slug: topic.slug },
      update: {},
      create: topic,
    })
  }
  console.log(`✅ Created ${topics.length} topics`)

  // Create sample post
  const airflowTopic = await prisma.topic.findUnique({ where: { slug: 'airflow' } })
  const architectureTopic = await prisma.topic.findUnique({ where: { slug: 'architecture' } })

  const wordCount = samplePost.content.replace(/[#*`\[\]()>_]/g, '').split(/\s+/).length
  const readingTimeMin = Math.ceil(wordCount / 200)

  const post = await prisma.post.upsert({
    where: { slug: samplePost.slug },
    update: {},
    create: {
      ...samplePost,
      readingTimeMin,
      published: true,
      publishedAt: new Date(),
      topics: {
        create: [
          ...(airflowTopic ? [{ topicId: airflowTopic.id }] : []),
          ...(architectureTopic ? [{ topicId: architectureTopic.id }] : []),
        ],
      },
    },
  })
  console.log(`✅ Created sample post: "${post.title}"`)
  console.log('🎉 Done!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
