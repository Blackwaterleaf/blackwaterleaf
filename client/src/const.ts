export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/** Opens BlackWaterLeaf's own account access page from an event handler. */
export const startLogin = () => {
  window.location.assign("/login");
};
