<template>
  <div class="container" style="max-width: 860px;">
    <h2 class="mb-3">{{ t("create_banner") }}</h2>

    <div v-if="error" class="alert alert-danger py-2">{{ error }}</div>
    <div v-if="status" class="alert alert-success py-2">{{ status }}</div>

    <div class="card bg-dark text-white border border-secondary-subtle mb-3">
      <div class="card-body">
        <form class="d-flex flex-column gap-3" @submit.prevent="saveBanner">
          <div>
            <label class="form-label text-white-50">{{ t("link_url") }}</label>
            <input
              v-model="url"
              type="url"
              name="url"
              class="form-control"
              maxlength="255"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label class="form-label text-white-50">{{ t("photo_upload") }}</label>
            <input ref="imageInput" type="file" name="image" class="form-control" accept="image/*" required />
          </div>

          <div class="d-flex gap-2">
            <button :disabled="busy" type="submit" class="btn btn-primary">{{ busy ? t("saving") : t("save_banner") }}</button>
            <RouterLink to="/" class="btn btn-outline-light">{{ t("back_home") }}</RouterLink>
          </div>
        </form>
      </div>
    </div>

    <div v-if="banners.length" class="card bg-dark text-white border border-secondary-subtle">
      <div class="card-body d-flex flex-column gap-3">
        <div v-for="item in banners" :key="item.id" class="d-flex flex-wrap justify-content-between align-items-center gap-3 border rounded-3 p-3 border-secondary-subtle">
          <div>
            <a v-if="item.url" :href="item.url" target="_blank" rel="noopener noreferrer" class="small">{{ item.url }}</a>
            <div v-if="item.image_url" class="mt-2">
              <img :src="item.image_url" :alt="t('create_banner')" style="width:260px; max-width:100%; height:auto; border-radius:12px; border:1px solid rgba(255,255,255,.2);" />
            </div>
          </div>
          <button :disabled="busy" type="button" class="btn btn-outline-danger" @click="removeBanner(item.id)">{{ t("delete_banner") }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { adminService } from "../services/adminService";
import { useI18n } from "../composables/useI18n";

const { t } = useI18n();

const busy = ref(false);
const status = ref("");
const error = ref("");
const banners = ref([]);
const url = ref("");
const imageInput = ref(null);

const fileToPayload = (file) =>
  new Promise((resolve, reject) => {
    if (!(file instanceof File)) {
      reject(new Error(t("file_required")));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        name: file.name,
        type: file.type,
        dataUrl: String(reader.result || ""),
      });
    };
    reader.onerror = () => reject(new Error(t("failed_read_file")));
    reader.readAsDataURL(file);
  });

const load = async () => {
  error.value = "";
  try {
    const data = await adminService.getCreateData();
    const list = Array.isArray(data.home_banners) ? data.home_banners : data.home_banner ? [data.home_banner] : [];
    banners.value = list;
    url.value = "";
  } catch (e) {
    error.value = e.message || t("failed_load_banner");
  }
};

const saveBanner = async () => {
  status.value = "";
  error.value = "";
  busy.value = true;
  try {
    const file = imageInput.value?.files?.[0] || null;
    const image = file ? await fileToPayload(file) : null;
    await adminService.saveBanner({
      url: url.value.trim() || null,
      image,
    });
    status.value = t("banner_saved");
    if (imageInput.value) imageInput.value.value = "";
    await load();
  } catch (e) {
    error.value = e.message || t("failed_save_banner");
  } finally {
    busy.value = false;
  }
};

const removeBanner = async (id) => {
  if (!id) return;
  if (!window.confirm(t("delete_banner_confirm"))) return;
  status.value = "";
  error.value = "";
  busy.value = true;
  try {
    await adminService.deleteBanner(id);
    status.value = t("banner_deleted");
    await load();
  } catch (e) {
    error.value = e.message || t("failed_delete_banner");
  } finally {
    busy.value = false;
  }
};

onMounted(load);
</script>
