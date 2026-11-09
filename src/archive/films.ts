export interface SheetInfo {
  url: string;
  w: number;
  h: number;
}

export type SheetId = 'covers' | 'spines' | 'fix' | 'fix2';

export const SHEETS: Record<SheetId, SheetInfo> = {
  covers: {
    url: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261029_010644_837e04ca-2418-45c1-b8e0-0233265c4cd5.png&w=1744&q=85',
    w: 1744,
    h: 2336,
  },
  spines: {
    url: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261029_010738_a3e47ead-18f2-4974-9468-06d16a25edc5.png&w=2688&q=85',
    w: 2688,
    h: 1152,
  },
  fix: {
    url: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261029_010831_3ebb874b-93dc-433e-87ed-6299aba720f0.png&w=1520&q=85',
    w: 1520,
    h: 2688,
  },
  fix2: {
    url: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261029_092020_f96bc094-db7b-46de-9298-074a24e0a3b8.png&w=1520&q=85',
    w: 1520,
    h: 2688,
  },
};

export interface CropBox {
  sheet: SheetId;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FilmItem {
  id: string;
  title: string;
  titleVi: string;
  romaji: string;
  kanji: string;
  year: number;
  genre: string;
  genreVi: string;
  min: number;
  synopsis: string;
  spine: CropBox;
  cover: CropBox;
}

export const FILMS: FilmItem[] = [
  {
    id: 'valley',
    title: 'The Silent Valley',
    titleVi: 'Thung Lũng Tĩnh Lặng',
    romaji: 'SHIZUKANA TANI',
    kanji: '静かな谷',
    year: 1958,
    genre: 'Drama',
    genreVi: 'Chính kịch',
    min: 104,
    synopsis: 'Một cô giáo trở về ngôi làng miền núi nơi từng lưu đày cha mình, chỉ để nhận ra thung lũng vẫn chôn giấu vẹn nguyên từng bí mật ngày xưa.',
    spine: { sheet: 'spines', x: 266, y: 31, w: 189, h: 1089 },
    cover: { sheet: 'covers', x: 497, y: 72, w: 344, h: 659 },
  },
  {
    id: 'bluehour',
    title: 'The Blue Hour',
    titleVi: 'Giờ Xanh',
    romaji: 'AO NO TOKI',
    kanji: '青の刻',
    year: 1962,
    genre: 'Romance',
    genreVi: 'Lãng mạn',
    min: 97,
    synopsis: 'Trong suốt một buổi chiều muộn tại thị trấn cảng, một người góa phụ và một kẻ lạ mặt trao nhau những lời dối gian nhỏ bé cho đến khi ánh ngày tàn lụi.',
    spine: { sheet: 'spines', x: 492, y: 31, w: 189, h: 1089 },
    cover: { sheet: 'covers', x: 914, y: 72, w: 342, h: 659 },
  },
  {
    id: 'river',
    title: 'River of Salt',
    titleVi: 'Dòng Sông Muối',
    romaji: 'SHIO NO KAWA',
    kanji: '塩の川',
    year: 1964,
    genre: 'Drama',
    genreVi: 'Chính kịch',
    min: 121,
    synopsis: 'Hai anh em kéo chiếc sà lan muối xuôi dòng về phía thành phố—nơi không còn bất kỳ ai cần đến những gì họ mang theo.',
    spine: { sheet: 'fix', x: 197, y: 54, w: 324, h: 2566 },
    cover: { sheet: 'covers', x: 1332, y: 72, w: 344, h: 659 },
  },
  {
    id: 'summer',
    title: 'The Last Summer',
    titleVi: 'Mùa Hè Cuối Cùng',
    romaji: 'SAIGO NO NATSU',
    kanji: '最後の夏',
    year: 1966,
    genre: 'Drama',
    genreVi: 'Chính kịch',
    min: 109,
    synopsis: 'Mùa hè trước khi con đập nhấn chìm ngôi làng, ba người bạn thân châm lửa thiêu rụi tất cả những gì họ không thể mang theo.',
    spine: { sheet: 'spines', x: 937, y: 31, w: 188, h: 1089 },
    cover: { sheet: 'covers', x: 74, y: 813, w: 344, h: 676 },
  },
  {
    id: 'green',
    title: 'The Green Road',
    titleVi: 'Con Đường Xanh',
    romaji: 'MIDORI NO MICHI',
    kanji: '緑の道',
    year: 1969,
    genre: 'Mystery',
    genreVi: 'Bí ẩn',
    min: 101,
    synopsis: 'Một người đo đạc vẽ bản đồ con đường xuyên rừng liên tục bắt gặp những dấu chân giống hệt nhau, luôn đi trước ông đúng một ngày đường.',
    spine: { sheet: 'spines', x: 1157, y: 31, w: 185, h: 1090 },
    cover: { sheet: 'covers', x: 497, y: 815, w: 344, h: 674 },
  },
  {
    id: 'noon',
    title: 'Noon in Ashes',
    titleVi: 'Tro Tàn Lúc Giữa Trưa',
    romaji: 'HAI NO SHOGO',
    kanji: '灰の正午',
    year: 1971,
    genre: 'Western',
    genreVi: 'Viễn Tây',
    min: 112,
    synopsis: 'Một tay cưỡi ngựa băng qua sa mạc trắng xóa để thanh toán món nợ cũ, chỉ để nhận ra quá muộn kẻ đã cử mình đi.',
    spine: { sheet: 'spines', x: 44, y: 32, w: 184, h: 1088 },
    cover: { sheet: 'covers', x: 74, y: 72, w: 347, h: 659 },
  },
  {
    id: 'observer',
    title: 'The Observer',
    titleVi: 'Kẻ Quan Sát',
    romaji: 'KANSATSUSHA',
    kanji: '観察者',
    year: 1973,
    genre: 'Thriller',
    genreVi: 'Giật gân',
    min: 96,
    synopsis: 'Một nhân viên gác đêm bắt đầu nghi ngờ rằng tòa nhà đồ sộ mà ông canh giữ đang âm thầm dõi mắt quan sát ngược lại chính ông.',
    spine: { sheet: 'fix2', x: 371, y: 15, w: 349, h: 2655 },
    cover: { sheet: 'covers', x: 915, y: 815, w: 342, h: 675 },
  },
  {
    id: 'birds',
    title: 'The Fallen Birds',
    titleVi: 'Những Cánh Chim Rơi',
    romaji: 'OCHITA TORI',
    kanji: '落ちた鳥',
    year: 1975,
    genre: 'Drama',
    genreVi: 'Chính kịch',
    min: 118,
    synopsis: 'Khi muông chim bặt tiếng hót trên bầu trời thị trấn biên viễn, con gái của thị trưởng là người duy nhất dấn thân tìm kiếm nguyên do.',
    spine: { sheet: 'spines', x: 1573, y: 31, w: 183, h: 1089 },
    cover: { sheet: 'covers', x: 1331, y: 815, w: 345, h: 675 },
  },
  {
    id: 'storm',
    title: 'Light in the Storm',
    titleVi: 'Ánh Sáng Trong Bão Dữ',
    romaji: 'ARASHI NO HI',
    kanji: '嵐の灯',
    year: 1978,
    genre: 'Drama',
    genreVi: 'Chính kịch',
    min: 127,
    synopsis: 'Người gác hải đăng và con trai cùng chờ đợi cơn bão ba ngày tan đi bên cạnh một thủy thủ đắm tàu kiên quyết không tiết lộ tên mình.',
    spine: { sheet: 'fix2', x: 808, y: 15, w: 347, h: 2656 },
    cover: { sheet: 'covers', x: 74, y: 1571, w: 345, h: 681 },
  },
  {
    id: 'tide',
    title: 'The Long Tide',
    titleVi: 'Thủy Triều Dài',
    romaji: 'NAGAI SHIO',
    kanji: '長い潮',
    year: 1981,
    genre: 'Drama',
    genreVi: 'Chính kịch',
    min: 99,
    synopsis: 'Người vợ người ngư dân ngồi đếm từng con nước lớn trên bức tường đê chắn sóng, trong khi con thuyền của chồng bà mãi không trở về.',
    spine: { sheet: 'spines', x: 2012, y: 31, w: 188, h: 1089 },
    cover: { sheet: 'covers', x: 496, y: 1577, w: 343, h: 678 },
  },
  {
    id: 'war',
    title: 'A Quiet War',
    titleVi: 'Cuộc Chiến Lặng Câm',
    romaji: 'SHIZUKANA SENSO',
    kanji: '静かな戦争',
    year: 1985,
    genre: 'Comedy',
    genreVi: 'Hài kịch',
    min: 103,
    synopsis: 'Hai người hàng xóm trải qua một cuộc chiến thầm lặng bên bức tường hoa suốt ba mươi năm, và chẳng một ai còn nhớ mọi sự bắt đầu tự khi nào.',
    spine: { sheet: 'spines', x: 2236, y: 31, w: 189, h: 1089 },
    cover: { sheet: 'covers', x: 913, y: 1579, w: 343, h: 676 },
  },
  {
    id: 'door',
    title: 'Red Door',
    titleVi: 'Cánh Cửa Đỏ',
    romaji: 'AKAI TOBIRA',
    kanji: '赤扉',
    year: 1989,
    genre: 'Thriller',
    genreVi: 'Giật gân',
    min: 114,
    synopsis: 'Một người chiếu bóng lần theo cuộn phim không tên qua từng hành lang hun hút của rạp chiếu trong đêm trình chiếu cuối cùng.',
    spine: { sheet: 'spines', x: 2462, y: 31, w: 188, h: 1089 },
    cover: { sheet: 'covers', x: 1331, y: 1579, w: 344, h: 677 },
  },
];

export function getCropBackgroundStyle(crop: CropBox): React.CSSProperties {
  const sheet = SHEETS[crop.sheet];
  const sizeX = (sheet.w / crop.w) * 100;
  const sizeY = (sheet.h / crop.h) * 100;
  const posX = (crop.x / (sheet.w - crop.w)) * 100;
  const posY = (crop.y / (sheet.h - crop.h)) * 100;

  return {
    backgroundImage: `url("${sheet.url}")`,
    backgroundSize: `${sizeX}% ${sizeY}%`,
    backgroundPosition: `${posX}% ${posY}%`,
    backgroundRepeat: 'no-repeat',
  };
}

export function getSvgPosterCoords(crop: CropBox) {
  const sheet = SHEETS[crop.sheet];
  return {
    url: sheet.url,
    x: (-crop.x * 474) / crop.w,
    y: (-crop.y * 900) / crop.h,
    width: (sheet.w * 474) / crop.w,
    height: (sheet.h * 900) / crop.h,
  };
}

export function preloadSheets(): void {
  if (typeof window === 'undefined') return;
  Object.values(SHEETS).forEach((s) => {
    const img = new Image();
    img.src = s.url;
  });
}
