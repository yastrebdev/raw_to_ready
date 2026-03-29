// components/TopicBadge.tsx

interface Topic {
  name: string
  slug: string
  color: string
}

interface TopicBadgeProps {
  topic: Topic
  clickable?: boolean
  active?: boolean
  onClick?: () => void
}

export default function TopicBadge({ topic, clickable = false, active = false, onClick }: TopicBadgeProps) {
  const style = {
    backgroundColor: active ? topic.color : `${topic.color}18`,
    color: active ? '#fff' : topic.color,
    borderColor: `${topic.color}40`,
  }

  if (clickable || onClick) {
    return (
      <button
        onClick={onClick}
        style={style}
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all cursor-pointer hover:opacity-80"
      >
        {topic.name}
      </button>
    )
  }

  return (
    <span
      style={style}
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
    >
      {topic.name}
    </span>
  )
}
