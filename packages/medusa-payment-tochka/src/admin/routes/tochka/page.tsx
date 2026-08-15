import { defineRouteConfig } from "@medusajs/admin-sdk"
import { CreditCard } from "@medusajs/icons"
import {
  Badge,
  Button,
  Copy,
  Drawer,
  Heading,
  Input,
  Label,
  Select,
  Spinner,
  StatusBadge,
  Switch,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import {
  TOCHKA_PAYMENT_MODES,
  TOCHKA_TAX_SYSTEM_CODES,
  TOCHKA_VAT_TYPES,
  type PublicTochkaOptions,
  type TochkaOptionsPatch,
  type TochkaPaymentMode,
  type TochkaTaxSystemCode,
  type TochkaVatType,
  prettifyMaskedSecret,
} from "../../../lib/tochka-options"
import {
  ActionMenu,
  Header,
  SectionRow,
  SettingsCard,
  TwoColumnLayout,
} from "../../components"
import { useTochkaOptions, useUpdateTochkaOptions } from "../../hooks"
import { getTochkaCopy, type TochkaCopy } from "../../lib/copy"

type EditModal =
  | "general"
  | "payment"
  | "methods"
  | "receipts"
  | "webhook"
  | null

const TochkaPage = () => {
  const { i18n } = useTranslation()
  const copy = getTochkaCopy(i18n.language)
  const { data, isError, isLoading } = useTochkaOptions()
  const location = useLocation()
  const navigate = useNavigate()
  const modal = new URLSearchParams(location.search).get("edit") as EditModal
  const options = data?.tochka_options

  const openModal = (name: Exclude<EditModal, null>) => {
    const nextParams = new URLSearchParams(location.search)
    nextParams.set("edit", name)
    navigate(
      { pathname: location.pathname, search: nextParams.toString() },
      { replace: false }
    )
  }

  const closeModal = () => {
    const nextParams = new URLSearchParams(location.search)
    nextParams.delete("edit")
    navigate(
      { pathname: location.pathname, search: nextParams.toString() },
      { replace: false }
    )
  }

  if (isLoading) {
    return (
      <SettingsCard>
        <div className="flex items-center justify-center px-6 py-16">
          <Spinner className="text-ui-fg-subtle animate-spin" />
        </div>
      </SettingsCard>
    )
  }

  if (isError || !options) {
    return (
      <SettingsCard>
        <div className="px-6 py-8">
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            {copy.loadError}
          </Text>
        </div>
      </SettingsCard>
    )
  }

  return (
    <>
      <TwoColumnLayout
        firstCol={
          <>
            <GeneralSection
              copy={copy}
              options={options}
              onEdit={() => openModal("general")}
            />
            <PaymentSection
              copy={copy}
              options={options}
              onEdit={() => openModal("payment")}
            />
            <MethodsSection
              copy={copy}
              options={options}
              onEdit={() => openModal("methods")}
            />
          </>
        }
        secondCol={
          <>
            <ReceiptsSection
              copy={copy}
              options={options}
              onEdit={() => openModal("receipts")}
            />
            <WebhookSection
              copy={copy}
              options={options}
              onEdit={() => openModal("webhook")}
            />
          </>
        }
      />
      <GeneralEdit
        copy={copy}
        open={modal === "general"}
        onClose={closeModal}
        options={options}
      />
      <PaymentEdit
        copy={copy}
        open={modal === "payment"}
        onClose={closeModal}
        options={options}
      />
      <MethodsEdit
        copy={copy}
        open={modal === "methods"}
        onClose={closeModal}
        options={options}
      />
      <ReceiptsEdit
        copy={copy}
        open={modal === "receipts"}
        onClose={closeModal}
        options={options}
      />
      <WebhookEdit
        copy={copy}
        open={modal === "webhook"}
        onClose={closeModal}
        options={options}
      />
    </>
  )
}

const GeneralSection = ({
  copy,
  options,
  onEdit,
}: {
  copy: TochkaCopy
  options: PublicTochkaOptions
  onEdit: () => void
}) => {
  return (
    <SettingsCard>
      <Header
        title={copy.general.title}
        subtitle={copy.general.subtitle}
        actions={<ActionMenu label={copy.actions.edit} onEdit={onEdit} />}
      />
      <SectionRow
        title={copy.general.fields.jwtToken.label}
        value={
          options.jwt_token_configured ? (
            <Copy asChild content={options.jwt_token} className="cursor-pointer">
              <Badge size="2xsmall">
                {prettifyMaskedSecret(options.jwt_token)}
              </Badge>
            </Copy>
          ) : (
            "-"
          )
        }
      />
      <SectionRow
        title={copy.general.fields.clientId.label}
        value={options.client_id || "-"}
      />
      <SectionRow
        title={copy.general.fields.mode.label}
        value={
          <Badge size="2xsmall" className="block w-fit truncate">
            {options.developer_mode
              ? copy.statuses.test
              : copy.statuses.production}
          </Badge>
        }
      />
      <SectionRow
        title={copy.general.fields.apiVersion.label}
        value={options.api_version || "-"}
      />
    </SettingsCard>
  )
}

const PaymentSection = ({
  copy,
  options,
  onEdit,
}: {
  copy: TochkaCopy
  options: PublicTochkaOptions
  onEdit: () => void
}) => {
  return (
    <SettingsCard>
      <Header
        title={copy.payment.title}
        subtitle={copy.payment.subtitle}
        actions={<ActionMenu label={copy.actions.edit} onEdit={onEdit} />}
      />
      <SectionRow
        title={copy.payment.fields.purpose.label}
        value={options.payment_purpose || "-"}
      />
      <SectionRow
        title={copy.payment.fields.preAuthorization.label}
        value={
          <StatusBadge color={options.pre_authorization ? "green" : "red"}>
            {options.pre_authorization
              ? copy.statuses.enabled
              : copy.statuses.disabled}
          </StatusBadge>
        }
      />
      <SectionRow
        title={copy.payment.fields.storefrontUrl.label}
        value={options.storefront_url || "-"}
      />
    </SettingsCard>
  )
}

const MethodsSection = ({
  copy,
  options,
  onEdit,
}: {
  copy: TochkaCopy
  options: PublicTochkaOptions
  onEdit: () => void
}) => {
  const enabled = useMemo(
    () => new Set(options.payment_mode),
    [options.payment_mode]
  )

  return (
    <SettingsCard>
      <Header
        title={copy.methods.title}
        subtitle={copy.methods.subtitle}
        actions={<ActionMenu label={copy.actions.edit} onEdit={onEdit} />}
      />
      <div className="txt-compact-small-plus text-ui-fg-subtle grid grid-cols-[1fr_1fr] px-6 py-2.5">
        <span>{copy.methods.fields.method}</span>
        <span>{copy.methods.fields.status}</span>
      </div>
      {TOCHKA_PAYMENT_MODES.map((mode) => {
        const isEnabled = enabled.has(mode)
        return (
          <div
            key={mode}
            className="grid grid-cols-[1fr_1fr] items-center px-6 py-3"
          >
            <Text size="small" leading="compact">
              {copy.methods.labels[mode]}
            </Text>
            <StatusBadge color={isEnabled ? "green" : "grey"}>
              {isEnabled ? copy.statuses.enabled : copy.statuses.disabled}
            </StatusBadge>
          </div>
        )
      })}
    </SettingsCard>
  )
}

const ReceiptsSection = ({
  copy,
  options,
  onEdit,
}: {
  copy: TochkaCopy
  options: PublicTochkaOptions
  onEdit: () => void
}) => {
  return (
    <SettingsCard>
      <Header
        title={copy.receipts.title}
        actions={<ActionMenu label={copy.actions.edit} onEdit={onEdit} />}
      />
      <SectionRow
        title={copy.receipts.fields.withReceipt.label}
        value={
          <StatusBadge color={options.with_receipt ? "green" : "red"}>
            {options.with_receipt
              ? copy.statuses.enabled
              : copy.statuses.disabled}
          </StatusBadge>
        }
      />
      <SectionRow
        title={copy.receipts.fields.taxSystem.label}
        value={
          <Badge size="2xsmall" className="block w-fit truncate">
            {copy.receipts.taxSystem[options.tax_system_code]}
          </Badge>
        }
      />
      <SectionRow
        title={copy.receipts.fields.itemVat.label}
        value={
          <Badge size="2xsmall" className="block w-fit truncate">
            {copy.receipts.vat[options.tax_item_default]}
          </Badge>
        }
      />
      <SectionRow
        title={copy.receipts.fields.shippingVat.label}
        value={
          <Badge size="2xsmall" className="block w-fit truncate">
            {copy.receipts.vat[options.tax_shipping_default]}
          </Badge>
        }
      />
    </SettingsCard>
  )
}

const WebhookSection = ({
  copy,
  options,
  onEdit,
}: {
  copy: TochkaCopy
  options: PublicTochkaOptions
  onEdit: () => void
}) => {
  return (
    <SettingsCard>
      <Header
        title={copy.webhook.title}
        subtitle={copy.webhook.subtitle}
        actions={<ActionMenu label={copy.actions.edit} onEdit={onEdit} />}
      />
      <SectionRow
        title={copy.webhook.fields.publicKey.label}
        value={
          options.webhook_public_key_configured ? (
            <Copy
              asChild
              content={options.webhook_public_key_json}
              className="cursor-pointer"
            >
              <Badge size="2xsmall">
                {prettifyMaskedSecret(options.webhook_public_key_json)}
              </Badge>
            </Copy>
          ) : (
            "-"
          )
        }
      />
    </SettingsCard>
  )
}

const EditDrawer = ({
  open,
  onClose,
  title,
  children,
  isPending,
  onSubmit,
  copy,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  isPending: boolean
  onSubmit: () => void
  copy: TochkaCopy
}) => {
  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose()
        }
      }}
    >
      <Drawer.Content>
        <Drawer.Header>
          <Heading>{title}</Heading>
        </Drawer.Header>
        <form
          className="flex flex-1 flex-col overflow-hidden"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit()
          }}
        >
          <Drawer.Body className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-y-8">{children}</div>
          </Drawer.Body>
          <Drawer.Footer>
            <div className="flex items-center justify-end gap-x-2">
              <Drawer.Close asChild>
                <Button size="small" variant="secondary" type="button">
                  {copy.actions.cancel}
                </Button>
              </Drawer.Close>
              <Button
                size="small"
                type="submit"
                isLoading={isPending}
                disabled={isPending}
              >
                {copy.actions.save}
              </Button>
            </div>
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer>
  )
}

const useOptionsMutation = (
  copyError: string,
  copySuccess: string,
  onClose: () => void
) => {
  const { mutateAsync, isPending } = useUpdateTochkaOptions()

  const submit = async (payload: TochkaOptionsPatch) => {
    try {
      await mutateAsync(payload)
      toast.success(copySuccess)
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : copyError)
    }
  }

  return { submit, isPending }
}

const GeneralEdit = ({
  copy,
  open,
  onClose,
  options,
}: {
  copy: TochkaCopy
  open: boolean
  onClose: () => void
  options: PublicTochkaOptions
}) => {
  const { submit, isPending } = useOptionsMutation(
    copy.general.edit.errorToast,
    copy.general.edit.successToast,
    onClose
  )
  const [jwtToken, setJwtToken] = useState("")
  const [clientId, setClientId] = useState(options.client_id)
  const [developerMode, setDeveloperMode] = useState(options.developer_mode)
  const [apiVersion, setApiVersion] = useState(options.api_version)

  useEffect(() => {
    setJwtToken("")
    setClientId(options.client_id)
    setDeveloperMode(options.developer_mode)
    setApiVersion(options.api_version)
  }, [options, open])

  return (
    <EditDrawer
      copy={copy}
      open={open}
      onClose={onClose}
      title={copy.general.edit.header}
      isPending={isPending}
      onSubmit={() =>
        submit({
          jwt_token: jwtToken,
          client_id: clientId,
          developer_mode: developerMode,
          api_version: apiVersion,
        })
      }
    >
      <Field label={copy.general.fields.jwtToken.label}>
        <Input
          type="password"
          autoComplete="off"
          placeholder={copy.general.fields.jwtToken.placeholder}
          value={jwtToken}
          onChange={(event) => setJwtToken(event.target.value)}
        />
      </Field>
      <Field label={copy.general.fields.clientId.label}>
        <Input
          placeholder={copy.general.fields.clientId.placeholder}
          value={clientId}
          onChange={(event) => setClientId(event.target.value)}
        />
      </Field>
      <Field label={copy.general.fields.mode.label}>
        <Select
          value={developerMode ? "test" : "production"}
          onValueChange={(value) => setDeveloperMode(value === "test")}
        >
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="production">
              {copy.statuses.production}
            </Select.Item>
            <Select.Item value="test">{copy.statuses.test}</Select.Item>
          </Select.Content>
        </Select>
      </Field>
      <Field label={copy.general.fields.apiVersion.label}>
        <Input
          value={apiVersion}
          onChange={(event) => setApiVersion(event.target.value)}
        />
      </Field>
    </EditDrawer>
  )
}

const PaymentEdit = ({
  copy,
  open,
  onClose,
  options,
}: {
  copy: TochkaCopy
  open: boolean
  onClose: () => void
  options: PublicTochkaOptions
}) => {
  const { submit, isPending } = useOptionsMutation(
    copy.payment.edit.errorToast,
    copy.payment.edit.successToast,
    onClose
  )
  const [purpose, setPurpose] = useState(options.payment_purpose)
  const [preAuthorization, setPreAuthorization] = useState(
    options.pre_authorization
  )
  const [storefrontUrl, setStorefrontUrl] = useState(options.storefront_url)

  useEffect(() => {
    setPurpose(options.payment_purpose)
    setPreAuthorization(options.pre_authorization)
    setStorefrontUrl(options.storefront_url)
  }, [options, open])

  return (
    <EditDrawer
      copy={copy}
      open={open}
      onClose={onClose}
      title={copy.payment.edit.header}
      isPending={isPending}
      onSubmit={() =>
        submit({
          payment_purpose: purpose,
          pre_authorization: preAuthorization,
          storefront_url: storefrontUrl,
        })
      }
    >
      <Field label={copy.payment.fields.purpose.label}>
        <Input
          placeholder={copy.payment.fields.purpose.placeholder}
          value={purpose}
          onChange={(event) => setPurpose(event.target.value)}
        />
      </Field>
      <SwitchField
        label={copy.payment.fields.preAuthorization.label}
        checked={preAuthorization}
        onCheckedChange={setPreAuthorization}
      />
      <Field label={copy.payment.fields.storefrontUrl.label}>
        <Input
          placeholder={copy.payment.fields.storefrontUrl.placeholder}
          value={storefrontUrl}
          onChange={(event) => setStorefrontUrl(event.target.value)}
        />
      </Field>
    </EditDrawer>
  )
}

const MethodsEdit = ({
  copy,
  open,
  onClose,
  options,
}: {
  copy: TochkaCopy
  open: boolean
  onClose: () => void
  options: PublicTochkaOptions
}) => {
  const { submit, isPending } = useOptionsMutation(
    copy.methods.edit.errorToast,
    copy.methods.edit.successToast,
    onClose
  )
  const [modes, setModes] = useState<TochkaPaymentMode[]>(options.payment_mode)

  useEffect(() => {
    setModes(options.payment_mode)
  }, [options, open])

  const toggleMode = (mode: TochkaPaymentMode, enabled: boolean) => {
    setModes((current) => {
      if (enabled) {
        return TOCHKA_PAYMENT_MODES.filter(
          (item) => item === mode || current.includes(item)
        )
      }
      return current.filter((item) => item !== mode)
    })
  }

  return (
    <EditDrawer
      copy={copy}
      open={open}
      onClose={onClose}
      title={copy.methods.edit.header}
      isPending={isPending}
      onSubmit={() => {
        if (!modes.length) {
          toast.error(copy.methods.edit.errorToast)
          return
        }
        submit({ payment_mode: modes })
      }}
    >
      {TOCHKA_PAYMENT_MODES.map((mode) => (
        <SwitchField
          key={mode}
          label={copy.methods.labels[mode]}
          checked={modes.includes(mode)}
          onCheckedChange={(checked) => toggleMode(mode, checked)}
        />
      ))}
    </EditDrawer>
  )
}

const ReceiptsEdit = ({
  copy,
  open,
  onClose,
  options,
}: {
  copy: TochkaCopy
  open: boolean
  onClose: () => void
  options: PublicTochkaOptions
}) => {
  const { submit, isPending } = useOptionsMutation(
    copy.receipts.edit.errorToast,
    copy.receipts.edit.successToast,
    onClose
  )
  const [withReceipt, setWithReceipt] = useState(options.with_receipt)
  const [taxSystem, setTaxSystem] = useState(options.tax_system_code)
  const [itemVat, setItemVat] = useState(options.tax_item_default)
  const [shippingVat, setShippingVat] = useState(options.tax_shipping_default)

  useEffect(() => {
    setWithReceipt(options.with_receipt)
    setTaxSystem(options.tax_system_code)
    setItemVat(options.tax_item_default)
    setShippingVat(options.tax_shipping_default)
  }, [options, open])

  return (
    <EditDrawer
      copy={copy}
      open={open}
      onClose={onClose}
      title={copy.receipts.edit.header}
      isPending={isPending}
      onSubmit={() =>
        submit({
          with_receipt: withReceipt,
          tax_system_code: taxSystem,
          tax_item_default: itemVat,
          tax_shipping_default: shippingVat,
        })
      }
    >
      <SwitchField
        label={copy.receipts.fields.withReceipt.label}
        checked={withReceipt}
        onCheckedChange={setWithReceipt}
      />
      <Field label={copy.receipts.fields.taxSystem.label}>
        <Select
          value={taxSystem}
          onValueChange={(value) => setTaxSystem(value as TochkaTaxSystemCode)}
        >
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {TOCHKA_TAX_SYSTEM_CODES.map((code) => (
              <Select.Item key={code} value={code}>
                {copy.receipts.taxSystem[code]}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </Field>
      <Field label={copy.receipts.fields.itemVat.label}>
        <Select
          value={itemVat}
          onValueChange={(value) => setItemVat(value as TochkaVatType)}
        >
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {TOCHKA_VAT_TYPES.map((code) => (
              <Select.Item key={code} value={code}>
                {copy.receipts.vat[code]}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </Field>
      <Field label={copy.receipts.fields.shippingVat.label}>
        <Select
          value={shippingVat}
          onValueChange={(value) => setShippingVat(value as TochkaVatType)}
        >
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {TOCHKA_VAT_TYPES.map((code) => (
              <Select.Item key={code} value={code}>
                {copy.receipts.vat[code]}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </Field>
    </EditDrawer>
  )
}

const WebhookEdit = ({
  copy,
  open,
  onClose,
  options,
}: {
  copy: TochkaCopy
  open: boolean
  onClose: () => void
  options: PublicTochkaOptions
}) => {
  const { submit, isPending } = useOptionsMutation(
    copy.webhook.edit.errorToast,
    copy.webhook.edit.successToast,
    onClose
  )
  const [publicKey, setPublicKey] = useState("")

  useEffect(() => {
    setPublicKey("")
  }, [options, open])

  return (
    <EditDrawer
      copy={copy}
      open={open}
      onClose={onClose}
      title={copy.webhook.edit.header}
      isPending={isPending}
      onSubmit={() => submit({ webhook_public_key_json: publicKey })}
    >
      <Field label={copy.webhook.fields.publicKey.label}>
        <Textarea
          rows={6}
          placeholder={copy.webhook.fields.publicKey.placeholder}
          value={publicKey}
          onChange={(event) => setPublicKey(event.target.value)}
        />
      </Field>
    </EditDrawer>
  )
}

const Field = ({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) => {
  return (
    <div className="flex flex-col gap-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

const SwitchField = ({
  label,
  checked,
  onCheckedChange,
}: {
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) => {
  return (
    <div className="flex items-center justify-between gap-x-2">
      <Label>{label}</Label>
      <Switch
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Tochka",
  icon: CreditCard,
})

export const handle = {
  breadcrumb: () => "Tochka",
}

export default TochkaPage
