import { EllipsisHorizontal, PencilSquare } from "@medusajs/icons"
import { clx, Container, DropdownMenu, Heading, IconButton, Text } from "@medusajs/ui"
import type { ReactNode } from "react"

export const TwoColumnLayout = ({
  firstCol,
  secondCol,
}: {
  firstCol: ReactNode
  secondCol: ReactNode
}) => {
  return (
    <div className="flex flex-col gap-y-3 xl:flex-row xl:items-start xl:gap-x-4">
      <div className="flex w-full flex-col gap-y-3">{firstCol}</div>
      <div className="flex w-full flex-col gap-y-3 xl:mt-0 xl:max-w-[440px]">
        {secondCol}
      </div>
    </div>
  )
}

export const Header = ({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
}) => {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div>
        <Heading level="h2">{title}</Heading>
        {subtitle ? (
          <Text className="text-ui-fg-subtle" size="small">
            {subtitle}
          </Text>
        ) : null}
      </div>
      {actions ? (
        <div className="flex items-center justify-center gap-x-2">{actions}</div>
      ) : null}
    </div>
  )
}

export const SectionRow = ({
  title,
  value,
}: {
  title: string
  value: ReactNode
}) => {
  const isSimpleText = typeof value === "string" || value === null || value === undefined

  return (
    <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
      <Text size="small" weight="plus" leading="compact">
        {title}
      </Text>
      {isSimpleText ? (
        <Text size="small" leading="compact" className="whitespace-pre-line text-pretty">
          {value ?? "-"}
        </Text>
      ) : (
        <div className="flex flex-wrap gap-1">{value}</div>
      )}
    </div>
  )
}

export const ActionMenu = ({
  label,
  onEdit,
}: {
  label: string
  onEdit: () => void
}) => {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <IconButton size="small" variant="transparent">
          <EllipsisHorizontal />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item
          className="[&_svg]:text-ui-fg-subtle flex items-center gap-x-2"
          onClick={onEdit}
        >
          <PencilSquare />
          {label}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}

export const SettingsCard = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => {
  return (
    <Container className={clx("divide-y p-0", className)}>{children}</Container>
  )
}
