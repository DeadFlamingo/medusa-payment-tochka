import type {
  PublicTochkaOptions,
  TochkaPaymentMode,
  TochkaTaxSystemCode,
  TochkaVatType,
} from "../../lib/tochka-options"

const en = {
  title: "Tochka",
  subtitle:
    "Manage Tochka Bank acquiring credentials, payment methods and fiscal receipts.",
  loading: "Loading Tochka settings...",
  loadError: "Failed to load Tochka settings.",
  actions: {
    edit: "Edit",
    cancel: "Cancel",
    save: "Save",
  },
  statuses: {
    production: "Production",
    test: "Developer",
    enabled: "Enabled",
    disabled: "Disabled",
    configured: "Configured",
    missing: "Not set",
  },
  general: {
    title: "Tochka",
    subtitle: "API credentials and operating mode used to create payment links.",
    edit: {
      header: "Edit Tochka",
      description: "Update JWT token, client ID and mode.",
      successToast: "Tochka connection updated.",
      errorToast: "Failed to update Tochka connection.",
    },
    fields: {
      jwtToken: {
        label: "JWT Token",
        placeholder: "Leave empty to keep the current token",
      },
      clientId: {
        label: "Client ID",
        placeholder: "Tochka client ID",
      },
      customerCode: {
        label: "Customer Code",
        placeholder: "OpenBanking customer code",
      },
      mode: { label: "Mode" },
      apiVersion: { label: "API Version" },
    },
  },
  payment: {
    title: "Payment",
    subtitle: "Default payment link behaviour.",
    edit: {
      header: "Edit Payment Settings",
      successToast: "Payment settings updated.",
      errorToast: "Failed to update payment settings.",
    },
    fields: {
      purpose: {
        label: "Payment Purpose",
        placeholder: "Payment for order",
      },
      preAuthorization: { label: "Two-step Payment" },
      storefrontUrl: {
        label: "Storefront URL",
        placeholder: "https://shop.example",
      },
    },
  },
  methods: {
    title: "Payment Methods",
    subtitle: "Methods available on Tochka payment links.",
    edit: {
      header: "Edit Payment Methods",
      successToast: "Payment methods updated.",
      errorToast: "Failed to update payment methods.",
    },
    fields: {
      method: "Method",
      status: "Status",
    },
    labels: {
      card: "Bank card",
      sbp: "SBP",
      tinkoff: "Tinkoff instalments",
      dolyame: "Dolyame",
    } satisfies Record<TochkaPaymentMode, string>,
  },
  receipts: {
    title: "Receipts & VAT",
    edit: {
      header: "Edit Receipt Settings",
      successToast: "Receipt settings updated.",
      errorToast: "Failed to update receipt settings.",
    },
    fields: {
      withReceipt: { label: "Fiscal Receipts" },
      taxSystem: { label: "Tax System" },
      itemVat: { label: "Product VAT" },
      shippingVat: { label: "Shipping VAT" },
    },
    taxSystem: {
      osn: "OSN",
      usn_income: "USN income",
      usn_income_outcome: "USN income − expenses",
      esn: "ESN",
      patent: "Patent",
    } satisfies Record<TochkaTaxSystemCode, string>,
    vat: {
      none: "No VAT",
      vat0: "0%",
      vat5: "5%",
      vat7: "7%",
      vat10: "10%",
      vat20: "20%",
      vat105: "5/105",
      vat107: "7/107",
      vat110: "10/110",
      vat120: "20/120",
    } satisfies Record<TochkaVatType, string>,
  },
  webhook: {
    title: "Webhooks",
    subtitle: "Public JWK used to verify Tochka payment notifications.",
    edit: {
      header: "Edit Webhook Key",
      successToast: "Webhook key updated.",
      errorToast: "Failed to update webhook key.",
    },
    fields: {
      publicKey: {
        label: "Webhook Public Key",
        placeholder: "Leave empty to keep the current JWK",
      },
    },
  },
}

const ru: typeof en = {
  title: "Точка",
  subtitle:
    "Учётные данные эквайринга Точка Банка, способы оплаты и фискальные чеки.",
  loading: "Загрузка настроек Точки...",
  loadError: "Не удалось загрузить настройки Точки.",
  actions: {
    edit: "Изменить",
    cancel: "Отмена",
    save: "Сохранить",
  },
  statuses: {
    production: "Production",
    test: "Developer",
    enabled: "Включено",
    disabled: "Выключено",
    configured: "Задано",
    missing: "Не задано",
  },
  general: {
    title: "Точка",
    subtitle:
      "API-токен и режим, которые используются для создания ссылок на оплату.",
    edit: {
      header: "Изменить Точку",
      description: "Обновите JWT-токен, client ID и режим.",
      successToast: "Подключение Точки обновлено.",
      errorToast: "Не удалось обновить подключение Точки.",
    },
    fields: {
      jwtToken: {
        label: "JWT-токен",
        placeholder: "Оставьте пустым, чтобы сохранить текущий токен",
      },
      clientId: {
        label: "Client ID",
        placeholder: "Client ID Точки",
      },
      customerCode: {
        label: "Код клиента",
        placeholder: "Код клиента OpenBanking",
      },
      mode: { label: "Режим" },
      apiVersion: { label: "Версия API" },
    },
  },
  payment: {
    title: "Оплата",
    subtitle: "Поведение платёжной ссылки по умолчанию.",
    edit: {
      header: "Изменить настройки оплаты",
      successToast: "Настройки оплаты обновлены.",
      errorToast: "Не удалось обновить настройки оплаты.",
    },
    fields: {
      purpose: {
        label: "Назначение платежа",
        placeholder: "Оплата заказа",
      },
      preAuthorization: { label: "Двухстадийная оплата" },
      storefrontUrl: {
        label: "URL витрины",
        placeholder: "https://shop.example",
      },
    },
  },
  methods: {
    title: "Способы оплаты",
    subtitle: "Методы, доступные на платёжной ссылке Точки.",
    edit: {
      header: "Изменить способы оплаты",
      successToast: "Способы оплаты обновлены.",
      errorToast: "Не удалось обновить способы оплаты.",
    },
    fields: {
      method: "Способ",
      status: "Статус",
    },
    labels: {
      card: "Банковская карта",
      sbp: "СБП",
      tinkoff: "Рассрочка Т-Банка",
      dolyame: "Долями",
    },
  },
  receipts: {
    title: "Чеки и НДС",
    edit: {
      header: "Изменить настройки чеков",
      successToast: "Настройки чеков обновлены.",
      errorToast: "Не удалось обновить настройки чеков.",
    },
    fields: {
      withReceipt: { label: "Фискальные чеки" },
      taxSystem: { label: "Система налогообложения" },
      itemVat: { label: "НДС товаров" },
      shippingVat: { label: "НДС доставки" },
    },
    taxSystem: {
      osn: "ОСН",
      usn_income: "УСН доходы",
      usn_income_outcome: "УСН доходы − расходы",
      esn: "ЕСН",
      patent: "Патент",
    },
    vat: {
      none: "Без НДС",
      vat0: "0%",
      vat5: "5%",
      vat7: "7%",
      vat10: "10%",
      vat20: "20%",
      vat105: "5/105",
      vat107: "7/107",
      vat110: "10/110",
      vat120: "20/120",
    },
  },
  webhook: {
    title: "Вебхуки",
    subtitle: "Публичный JWK для проверки уведомлений об оплате.",
    edit: {
      header: "Изменить ключ вебхука",
      successToast: "Ключ вебхука обновлён.",
      errorToast: "Не удалось обновить ключ вебхука.",
    },
    fields: {
      publicKey: {
        label: "Публичный ключ вебхука",
        placeholder: "Оставьте пустым, чтобы сохранить текущий JWK",
      },
    },
  },
}

export type TochkaCopy = typeof en

export function getTochkaCopy(language?: string): TochkaCopy {
  return language?.toLowerCase().startsWith("ru") ? ru : en
}

export type TochkaOptionsResponse = {
  tochka_options: PublicTochkaOptions
}
