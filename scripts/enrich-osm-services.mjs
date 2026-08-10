import fs from "node:fs/promises";

const path = new URL("../data/osm-services.json", import.meta.url);
const data = JSON.parse(await fs.readFile(path, "utf8"));

for (const item of data.elements) {
  const tags = item.tags || {};
  if (tags.amenity !== "police" && tags.amenity !== "fire_station") continue;
  const point = item.lat ? [item.lat, item.lon] : item.center ? [item.center.lat, item.center.lon] : null;
  if (!point) continue;
  const response = await fetch(`https://api-adresse.data.gouv.fr/reverse/?lat=${point[0]}&lon=${point[1]}`);
  if (!response.ok) continue;
  const result = await response.json();
  const address = result.features?.[0]?.properties;
  if (!address) continue;
  tags.ban_label = address.label;
  tags.ban_city = address.city;
  tags.ban_postcode = address.postcode;
  tags.ban_context = address.context;
}

await fs.writeFile(path, `${JSON.stringify(data, null, 2)}\n`);
