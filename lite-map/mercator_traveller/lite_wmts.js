function getWMTS(x, y, z, serverName = 'osm') {
	let prefix = ['a', 'b', 'c'];
	let s = prefix[Math.floor(random(prefix.length))];

	switch (serverName) {
		case 'osm': return `https://${s}.tile.osm.org/${z}/${x}/${y}.png`;
		case 'light': return `http://${s}.basemaps.cartocdn.com/light_all/${z}/${x}/${y}.png`;
		case 'dark': return `http://${s}.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png`;
		case 'voyager': return `http://${s}.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`;
		case 'light_nolabels': return `http://${s}.basemaps.cartocdn.com/light_nolabels/${z}/${x}/${y}.png`;
		case 'light_only_labels': return `http://${s}.basemaps.cartocdn.com/light_only_labels/${z}/${x}/${y}.png`;
		case 'dark_nolabels': return `http://${s}.basemaps.cartocdn.com/dark_nolabels/${z}/${x}/${y}.png`;
		case 'dark_only_labels': return `http://${s}.basemaps.cartocdn.com/dark_only_labels/${z}/${x}/${y}.png`;
		case 'voyager_nolabels': return `http://${s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/${z}/${x}/${y}.png`;
		case 'voyager_only_labels': return `http://${s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/${z}/${x}/${y}.png`;
		case 'voyager_labels_under': return `http://${s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/${z}/${x}/${y}.png`;
		case 'toner': return `https://stamen-tiles.a.ssl.fastly.net/toner/${z}/${x}/${y}.png`;
		case 'terrain': return `https://stamen-tiles.a.ssl.fastly.net/terrain/${z}/${x}/${y}.png`;
		case 'watercolor': return `https://stamen-tiles.a.ssl.fastly.net/watercolor/${z}/${x}/${y}.png`;
		case 'yandex_sat': return `https://sat04.maps.yandex.net/tiles?l=sat&x=${x}&y=${y}&z=${z}`;
		case 'yandex_traffic': return `https://core-jams-rdr-cache.maps.yandex.net/1.1/tiles?l=trf&x=${x}&y=${y}&z=${z}`;
		case 'yandex_gps': return `https://core-gpstiles.maps.yandex.net/tiles?style=point&x=${x}&y=${y}&z=${z}`;
		default: return `https://${s}.tile.osm.org/${z}/${x}/${y}.png`;
	}
}

let serverNames = [
	{ 'name' : 'osm', 'osm' : true },
	{ 'name' : 'light', 'light' : false },
	{ 'name' : 'dark', 'dark' : false },
	{ 'name' : 'voyager', 'voyager' : false },
	{ 'name' : 'light_nolabels', 'light_nolabels' : false },
	{ 'name' : 'light_only_labels', 'light_only_labels' : false },
	{ 'name' : 'dark_nolabels', 'dark_nolabels' : false },
	{ 'name' : 'dark_only_labels', 'dark_only_labels' : false },
	{ 'name' : 'voyager_nolabels', 'voyager_nolabels' : false },
	{ 'name' : 'voyager_only_labels', 'voyager_only_labels' : false },
	{ 'name' : 'voyager_labels_under', 'voyager_labels_under' : false },
	{ 'name' : 'toner', 'toner' : false },
	{ 'name' : 'terrain', 'terrain' : false },
	{ 'name' : 'watercolor', 'watercolor' : false },
	{ 'name' : 'yandex_sat', 'yandex_sat' : false },
	{ 'name' : 'yandex_traffic', 'yandex_traffic' : false },
	{ 'name' : 'yandex_gps', 'yandex_gps' : false }
];
