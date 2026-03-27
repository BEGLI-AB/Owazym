<template>
  <section class="admin-sms-page">
    <div v-if="error" class="alert alert-danger py-2 mb-0">{{ error }}</div>
    <div v-if="status" class="alert alert-success py-2 mb-0">{{ status }}</div>

    <section class="admin-sms-hero">
      <div>
        <div class="admin-sms-eyebrow">{{ copy.eyebrow }}</div>
        <h1 class="admin-sms-title">{{ copy.title }}</h1>
        <p class="admin-sms-subtitle">{{ copy.subtitle }}</p>
      </div>

      <div class="admin-sms-stats">
        <div class="admin-sms-stat-card">
          <span class="admin-sms-stat-label">{{ copy.totalLabel }}</span>
          <strong class="admin-sms-stat-value">{{ messages.length }}</strong>
        </div>
        <div class="admin-sms-stat-card">
          <span class="admin-sms-stat-label">{{ copy.unreadLabel }}</span>
          <strong class="admin-sms-stat-value">{{ unreadCount }}</strong>
        </div>
      </div>
    </section>

    <section class="admin-sms-panel">
      <div class="admin-sms-toolbar">
        <button type="button" class="btn btn-outline-light rounded-pill px-4" :disabled="loading" @click="loadMessages">
          {{ loading ? copy.loading : copy.refresh }}
        </button>
      </div>

      <div v-if="loading && !messages.length" class="admin-sms-empty">{{ copy.loading }}</div>

      <div v-else-if="!messages.length" class="admin-sms-empty">
        <div class="admin-sms-empty-title">{{ copy.emptyTitle }}</div>
        <p class="admin-sms-empty-text">{{ copy.emptyText }}</p>
      </div>

      <div v-else class="admin-sms-list">
        <article
          v-for="item in messages"
          :key="item.id"
          class="admin-sms-card"
          :class="{ 'admin-sms-card-unread': !item.isRead }"
        >
          <div class="admin-sms-card-top">
            <div>
              <div class="admin-sms-sender">{{ resolveSender(item) }}</div>
              <div class="admin-sms-meta">
                <span>{{ copy.sentAt }}: {{ formatDate(item.createdAt) }}</span>
                <span>{{ copy.accountLabel }}: {{ resolveAccount(item) }}</span>
                <span>{{ copy.emailLabel }}: {{ item.email || copy.noEmail }}</span>
              </div>
            </div>

            <span class="admin-sms-badge" :class="item.isRead ? 'admin-sms-badge-read' : 'admin-sms-badge-unread'">
              {{ item.isRead ? copy.read : copy.unread }}
            </span>
          </div>

          <div class="admin-sms-message">{{ item.message }}</div>

          <div class="admin-sms-footer">
            <div class="admin-sms-actions">
              <button
                v-if="!item.isRead"
                type="button"
                class="btn btn-outline-light rounded-pill px-3"
                :disabled="isPending(item.id)"
                @click="markRead(item.id)"
              >
                {{ isPending(item.id) ? copy.saving : copy.markRead }}
              </button>

              <button
                type="button"
                class="btn btn-outline-danger rounded-pill px-3"
                :disabled="isPending(item.id)"
                @click="removeMessage(item.id)"
              >
                {{ isPending(item.id) ? copy.saving : copy.delete }}
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "../composables/useI18n";
import { adminService } from "../services/adminService";

const { locale } = useI18n();

const loading = ref(false);
const error = ref("");
const status = ref("");
const messages = ref([]);
const pendingIds = ref([]);

const translations = {
  tm: {
    eyebrow: "Admin SMS",
    title: "Ulanyjylardan gelen SMS habarlary",
    subtitle: "Support formasyndan gelen hemme habar shu yerde saklanyar. Oka, bellap gec ya-da poz.",
    totalLabel: "Jemi",
    unreadLabel: "Okalmadyk",
    refresh: "Tazele",
    loading: "Yuklenyar...",
    emptyTitle: "SMS yok",
    emptyText: "Hazirlikca admin inbox bosh.",
    sentAt: "Ugradylan wagty",
    accountLabel: "Akkaunt",
    emailLabel: "Email",
    noEmail: "Yok",
    noData: "-",
    read: "Okaldy",
    unread: "Taze",
    markRead: "Okaldy et",
    delete: "Poz",
    saving: "Saklanyar...",
    loaded: "SMS sanawy yenelendi.",
    readDone: "SMS okaldy diyip bellendi.",
    deleted: "SMS pozuldy.",
    failed: "SMS maglumatlaryny yuklap bolmady.",
    unknownUser: "Anonim",
  },
  ru: {
    eyebrow: "Admin SMS",
    title: "\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F \u043E\u0442 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439",
    subtitle: "\u0421\u044E\u0434\u0430 \u043F\u0430\u0434\u0430\u044E\u0442 \u0432\u0441\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F \u0441\u043E \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B support. \u0418\u0445 \u043C\u043E\u0436\u043D\u043E \u043F\u0440\u043E\u0447\u0438\u0442\u0430\u0442\u044C, \u043F\u043E\u043C\u0435\u0442\u0438\u0442\u044C \u0438\u043B\u0438 \u0443\u0434\u0430\u043B\u0438\u0442\u044C.",
    totalLabel: "\u0412\u0441\u0435\u0433\u043E",
    unreadLabel: "\u041D\u0435\u043F\u0440\u043E\u0447\u0438\u0442\u0430\u043D\u043D\u044B\u0435",
    refresh: "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C",
    loading: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...",
    emptyTitle: "\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0439 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442",
    emptyText: "\u041A\u0430\u043A \u0442\u043E\u043B\u044C\u043A\u043E \u043A\u0442\u043E-\u0442\u043E \u043D\u0430\u043F\u0438\u0448\u0435\u0442 \u0432 support, \u043E\u043D\u043E \u043F\u043E\u044F\u0432\u0438\u0442\u0441\u044F \u0437\u0434\u0435\u0441\u044C.",
    sentAt: "\u041E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E",
    accountLabel: "\u0410\u043A\u043A\u0430\u0443\u043D\u0442",
    emailLabel: "Email",
    noEmail: "\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D",
    noData: "-",
    read: "\u041F\u0440\u043E\u0447\u0438\u0442\u0430\u043D\u043E",
    unread: "\u041D\u043E\u0432\u043E\u0435",
    markRead: "\u041F\u043E\u043C\u0435\u0442\u0438\u0442\u044C \u043A\u0430\u043A \u043F\u0440\u043E\u0447\u0438\u0442\u0430\u043D\u043D\u043E\u0435",
    delete: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C",
    saving: "\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435...",
    loaded: "\u0421\u043F\u0438\u0441\u043E\u043A SMS \u043E\u0431\u043D\u043E\u0432\u043B\u0451\u043D.",
    readDone: "SMS \u043F\u043E\u043C\u0435\u0447\u0435\u043D \u043A\u0430\u043A \u043F\u0440\u043E\u0447\u0438\u0442\u0430\u043D\u043D\u044B\u0439.",
    deleted: "SMS \u0443\u0434\u0430\u043B\u0451\u043D.",
    failed: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C SMS.",
    unknownUser: "\u0410\u043D\u043E\u043D\u0438\u043C",
  },
  en: {
    eyebrow: "Admin SMS",
    title: "Messages from users",
    subtitle: "Every message from the support page is stored here. Read it, mark it, or remove it from the admin inbox.",
    totalLabel: "Total",
    unreadLabel: "Unread",
    refresh: "Refresh",
    loading: "Loading...",
    emptyTitle: "No messages yet",
    emptyText: "As soon as someone submits the support form, the message will show up here.",
    sentAt: "Sent",
    accountLabel: "Account",
    emailLabel: "Email",
    noEmail: "Not provided",
    noData: "-",
    read: "Read",
    unread: "New",
    markRead: "Mark as read",
    delete: "Delete",
    saving: "Saving...",
    loaded: "SMS inbox refreshed.",
    readDone: "SMS marked as read.",
    deleted: "SMS deleted.",
    failed: "Failed to load SMS inbox.",
    unknownUser: "Anonymous",
  },
};

const copy = computed(() => translations[locale.value] || translations.en);
const unreadCount = computed(() => messages.value.filter((item) => !item.isRead).length);
const localeCode = computed(() => {
  if (locale.value === "ru") return "ru-RU";
  if (locale.value === "tm") return "tk-TM";
  return "en-US";
});

const isPending = (id) => pendingIds.value.includes(id);

const setPending = (id, value) => {
  pendingIds.value = value
    ? [...new Set([...pendingIds.value, id])]
    : pendingIds.value.filter((currentId) => currentId !== id);
};

const formatDate = (value) => {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat(localeCode.value, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
};

const resolveSender = (item) => String(item?.name || item?.userName || copy.value.unknownUser).trim() || copy.value.unknownUser;
const resolveAccount = (item) => {
  const userName = String(item?.userName || "").trim();
  const userId = item?.userId == null ? "" : String(item.userId).trim();
  if (userName && userId) return `${userName} (#${userId})`;
  if (userName) return userName;
  if (userId) return `#${userId}`;
  return copy.value.noData;
};

const loadMessages = async ({ silent = false } = {}) => {
  if (!silent) {
    error.value = "";
    status.value = "";
  }

  loading.value = true;

  try {
    messages.value = await adminService.listSms();
    if (!silent) {
      status.value = copy.value.loaded;
    }
  } catch (requestError) {
    error.value = requestError.message || copy.value.failed;
  } finally {
    loading.value = false;
  }
};

const markRead = async (id) => {
  error.value = "";
  status.value = "";
  setPending(id, true);

  try {
    const updated = await adminService.markSmsRead(id);
    messages.value = messages.value.map((item) => (item.id === id ? updated : item));
    status.value = copy.value.readDone;
  } catch (requestError) {
    error.value = requestError.message || copy.value.failed;
  } finally {
    setPending(id, false);
  }
};

const removeMessage = async (id) => {
  error.value = "";
  status.value = "";
  setPending(id, true);

  try {
    await adminService.deleteSms(id);
    messages.value = messages.value.filter((item) => item.id !== id);
    status.value = copy.value.deleted;
  } catch (requestError) {
    error.value = requestError.message || copy.value.failed;
  } finally {
    setPending(id, false);
  }
};

onMounted(() => {
  loadMessages({ silent: true });
});
</script>

<style scoped>
.admin-sms-page {
  width: 100%;
  display: grid;
  gap: 1rem;
}

.admin-sms-hero,
.admin-sms-panel,
.admin-sms-stat-card,
.admin-sms-card {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(12, 16, 26, 0.72);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(14px);
}

.admin-sms-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(280px, 0.7fr);
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 28px;
}

.admin-sms-panel {
  padding: 1.5rem;
  border-radius: 28px;
}

.admin-sms-eyebrow {
  margin-bottom: 0.55rem;
  color: rgba(255, 255, 255, 0.62);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.8rem;
}

.admin-sms-title {
  margin: 0 0 0.75rem;
  font-size: clamp(1.8rem, 3vw, 2.8rem);
  line-height: 1.1;
}

.admin-sms-subtitle {
  margin: 0;
  max-width: 760px;
  color: rgba(255, 255, 255, 0.74);
}

.admin-sms-stats {
  display: grid;
  gap: 0.75rem;
}

.admin-sms-stat-card {
  border-radius: 22px;
  padding: 1rem 1.15rem;
}

.admin-sms-stat-label,
.admin-sms-meta,
.admin-sms-empty-text {
  color: rgba(255, 255, 255, 0.64);
}

.admin-sms-stat-label {
  display: block;
  margin-bottom: 0.35rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.8rem;
}

.admin-sms-stat-value {
  font-size: 2rem;
  line-height: 1;
}

.admin-sms-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.admin-sms-empty {
  border: 1px dashed rgba(255, 255, 255, 0.14);
  border-radius: 22px;
  padding: 2rem 1.2rem;
  text-align: center;
}

.admin-sms-empty-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.45rem;
}

.admin-sms-empty-text {
  margin: 0;
}

.admin-sms-list {
  display: grid;
  gap: 1rem;
}

.admin-sms-card {
  border-radius: 24px;
  padding: 1.15rem;
}

.admin-sms-card-unread {
  border-color: rgba(96, 165, 250, 0.45);
  box-shadow: 0 18px 42px rgba(30, 64, 175, 0.18);
}

.admin-sms-card-top,
.admin-sms-footer {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.admin-sms-card-top {
  align-items: flex-start;
  margin-bottom: 0.9rem;
}

.admin-sms-footer {
  align-items: flex-end;
  margin-top: 1rem;
}

.admin-sms-sender {
  font-size: 1.08rem;
  font-weight: 700;
  margin-bottom: 0.35rem;
}

.admin-sms-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1rem;
  font-size: 0.92rem;
}

.admin-sms-message {
  white-space: pre-wrap;
  line-height: 1.65;
}

.admin-sms-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 88px;
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.admin-sms-badge-read {
  background: rgba(148, 163, 184, 0.14);
  color: #cbd5e1;
}

.admin-sms-badge-unread {
  background: rgba(59, 130, 246, 0.18);
  color: #bfdbfe;
}

.admin-sms-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

:global(body.light) .admin-sms-hero,
:global(body.light) .admin-sms-panel,
:global(body.light) .admin-sms-stat-card,
:global(body.light) .admin-sms-card,
:global(html[data-theme="light"]) .admin-sms-hero,
:global(html[data-theme="light"]) .admin-sms-panel,
:global(html[data-theme="light"]) .admin-sms-stat-card,
:global(html[data-theme="light"]) .admin-sms-card {
  border-color: rgba(15, 23, 42, 0.08);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.08);
}

:global(body.light) .admin-sms-title,
:global(body.light) .admin-sms-sender,
:global(body.light) .admin-sms-stat-value,
:global(html[data-theme="light"]) .admin-sms-title,
:global(html[data-theme="light"]) .admin-sms-sender,
:global(html[data-theme="light"]) .admin-sms-stat-value {
  color: #0f172a;
}

:global(body.light) .admin-sms-eyebrow,
:global(body.light) .admin-sms-subtitle,
:global(body.light) .admin-sms-stat-label,
:global(body.light) .admin-sms-meta,
:global(body.light) .admin-sms-empty-text,
:global(html[data-theme="light"]) .admin-sms-eyebrow,
:global(html[data-theme="light"]) .admin-sms-subtitle,
:global(html[data-theme="light"]) .admin-sms-stat-label,
:global(html[data-theme="light"]) .admin-sms-meta,
:global(html[data-theme="light"]) .admin-sms-empty-text {
  color: #64748b;
}

:global(body.light) .admin-sms-empty,
:global(html[data-theme="light"]) .admin-sms-empty {
  border-color: rgba(15, 23, 42, 0.12);
}

@media (max-width: 991.98px) {
  .admin-sms-hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767.98px) {
  .admin-sms-card-top,
  .admin-sms-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .admin-sms-badge {
    align-self: flex-start;
  }
}

@media (max-width: 575.98px) {
  .admin-sms-hero,
  .admin-sms-panel {
    padding: 1rem;
    border-radius: 22px;
  }

  .admin-sms-stat-card,
  .admin-sms-card,
  .admin-sms-empty {
    border-radius: 20px;
  }

  .admin-sms-actions {
    width: 100%;
  }

  .admin-sms-actions .btn {
    width: 100%;
  }
}
</style>
