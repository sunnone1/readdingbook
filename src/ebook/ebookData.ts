export interface EbookChapter {
  id: string;
  title: string;
  subtitle: string;
  pages: {
    pageNumber: number;
    header?: string;
    content: string[]; // paragraphs or screenplay lines
    type?: 'screenplay' | 'prose' | 'notes';
  }[];
}

export interface FilmEbook {
  filmId: string;
  filmTitle: string;
  romaji: string;
  kanji: string;
  year: number;
  edition: string;
  totalChapters: number;
  chapters: EbookChapter[];
}

export const EBOOK_DATABASE: Record<string, FilmEbook> = {
  noon: {
    filmId: 'noon',
    filmTitle: 'Noon in Ashes',
    romaji: 'HAI NO SHOGO',
    kanji: '灰の正午',
    year: 1971,
    edition: 'Ấn bản Lưu trữ Đầu tiên — Kyoto / Rome 1972',
    totalChapters: 3,
    chapters: [
      {
        id: 'screenplay-act1',
        title: 'Act I: The White Meridian',
        subtitle: 'Kịch bản phân cảnh gốc — Cảnh 1 đến 14',
        pages: [
          {
            pageNumber: 1,
            header: 'HAI NO SHOGO — KỊCH BẢN BẤM MÁY NGUYÊN BẢN',
            type: 'screenplay',
            content: [
              'CẢNH 1. NGOẠI CẢNH. LÒNG CHẢO BẠCH NGỌC — GIỮA TRƯA (1971)',
              'Ánh nắng chói lòa thiêu đốt. Đường chân trời hòa lẫn vào bãi muối trắng xóa, rung rinh trong làn ảo ảnh nhiệt đối lưu.',
              'Một kỵ sĩ cô độc, TATSUTA (khoảng 40 tuổi, áo khoác phủ bụi, vành nón sụp thấp), dắt chú ngựa hạt dẻ kiệt sức dọc theo mương thủy lợi cạn trơ đáy.',
              'Không một ngọn gió. Âm thanh duy nhất là tiếng móng ngựa cào sột soạt lên lớp vỏ vôi hóa giòn rụm.',
              'TATSUTA',
              '(không ngước mắt lên)',
              'Nếu giếng đã cạn, chúng ta sẽ quay lại lúc hoàng hôn. Cả hai ta đều không nợ thung lũng này nắm xương tàn.',
              'Ông dừng lại. Phía trước, chìm một nửa trong đụn thạch cao, là bộ khung trơ trụi của một trạm thu phí bỏ hoang.',
            ],
          },
          {
            pageNumber: 2,
            header: 'HAI NO SHOGO — KỊCH BẢN BẤM MÁY NGUYÊN BẢN',
            type: 'screenplay',
            content: [
              'CẢNH 2. NỘI CẢNH. TRẠM THU PHÍ — TIẾP NỐI',
              'Bóng tối cắt sắc lẹm qua những tấm ván gỗ như mực đen trên trang giấy kem. Những hạt bụi lơ lửng bất động.',
              'Trong góc, ngồi trên một kiện hàng lật úp: RENZO (khoảng 50 tuổi), đang lau chiếc đồng hồ bấm giờ bằng đồng cổ bằng một mảnh lụa đỏ.',
              'RENZO',
              'Cậu đến trễ hơn anh trai mình ba ngày. Tôi đã toan tự mình đào phần mương của cậu.',
              'TATSUTA',
              'Anh tôi không có bản đồ. Tôi có cuốn sổ cái của anh ấy.',
              'Tatsuta rút cuốn sổ tay bìa đen ố nước ra khỏi túi yên ngựa và đặt lên chiếc bàn kẽm. Một khoảng lặng nặng trĩu bao trùm.',
            ],
          },
        ],
      },
      {
        id: 'directors-notes',
        title: 'Chapter II: The Geometry of Exposure',
        subtitle: 'Nhật ký sản xuất của đạo diễn — Các buổi ghi hình tại Almería & Hokkaido',
        pages: [
          {
            pageNumber: 3,
            header: 'LEON VASARI: NHẬT KÝ SẢN XUẤT (THÁNG 8 NĂM 1970)',
            type: 'prose',
            content: [
              'Tôi muốn mặt trời hiện lên như một kẻ thẩm vấn không bao giờ chớp mắt. Trong điện ảnh Viễn Tây, sa mạc thường được miêu tả bằng gam màu nâu ấm hoài niệm—một đấu trường anh hùng ca. Chúng tôi đã làm điều hoàn toàn ngược lại.',
              'Chúng tôi quay trên phim nhựa 35mm tốc độ thấp 25 ASA, yêu cầu phòng tráng rọi quang học tại Rome đẩy độ tương phản hóa học lên cực hạn để màu trắng cháy rực như ánh sáng magie thô ráp, trong khi các mảng tối vẫn giữ được độ sâu nhung huyền của màu xanh cobalt.',
              'Tatsuta không phải một người hùng đòi lại công lý; ông là người kế toán của những niềm đau chưa được giải quyết. Khi ông phi ngựa về phía ống kính, chúng tôi không lùi máy lại mà giữ cố định ống kính tele 300mm cho đến khi bóng hình ông tan biến vào làn sóng nhiệt.',
            ],
          },
          {
            pageNumber: 4,
            header: 'LEON VASARI: NGHIÊN CỨU MÀU SẮC & IN LỤA',
            type: 'notes',
            content: [
              'Chiến lược sắc màu: Chỉ duy nhất ba sắc tố.',
              '1. Trắng Xương (Bone White): Bột canxi cacbonat nghiền mịn, đại diện trong phim bởi lòng chảo đất sét kiềm và trang phục vải lanh thô.',
              '2. Xanh Cobalt Vasari: Pha trộn với mực xanh Phổ cho tất cả các cảnh chuyển hoàng hôn và bình nước.',
              '3. Đỏ Chu Sa (Cinabro Vermilion): Chỉ xuất hiện duy nhất ở ba chi tiết: con dấu trên văn tự thuế, mảnh lụa của Renzo, và vệt máu trên sợi dây thừng giếng.',
              'Một bộ phim không nên sao chép hiện thực; nó phải giống như một giấc mơ được khắc tạc lên trang giấy khô.',
            ],
          },
        ],
      },
      {
        id: 'critical-essay',
        title: 'Chapter III: The Silence After Noon',
        subtitle: 'Chuyên khảo phê bình lưu trữ bởi TS. Carlo Moretti',
        pages: [
          {
            pageNumber: 5,
            header: 'CHUYÊN KHẢO LƯU TRỮ #06',
            type: 'prose',
            content: [
              'Khi Tro Tàn Lúc Giữa Trưa công chiếu tại Liên hoan phim Quốc tế Venice vào tháng 9 năm 1971, giới phê bình đã lúng túng khi cố gắng phân loại tiết tấu chậm rãi đầy chủ ý của nó. Liệu đây là một phim Viễn Tây Ý mang tính hiện sinh, hay một vở kịch Noh Nhật Bản tối giản được cấy ghép vào bãi muối Địa Trung Hải?',
              'Tài năng của Vasari nằm ở việc ông kiên quyết từ chối phục vụ những quy ước thể loại quen thuộc. Cuộc đối đầu bên bể chứa muối không có những màn đấu súng hay độc thoại kịch tính. Hai người đàn ông ngồi ở hai đầu chiếc bàn ngập nắng, bàn về những món nợ đã lãng quên trong khi đường chân trời từ từ chuyển nhiệt.',
              'Bản phát hành băng từ VHS năm 1982 đã trở thành một hiện vật kinh điển trong giới đạo diễn tiên phong Pháp và Mỹ, được ca ngợi bởi nhịp điệu thôi miên và thiết kế âm thanh tiếng gió hoang sơ cùng tiếng chuông xa xăm.',
            ],
          },
        ],
      },
    ],
  },
  observer: {
    filmId: 'observer',
    filmTitle: 'The Observer',
    romaji: 'KANSATSUSHA',
    kanji: '観察者',
    year: 1973,
    edition: 'Tập Kịch Bản Lưu Trữ — Tokyo Tele-Cine Press 1974',
    totalChapters: 2,
    chapters: [
      {
        id: 'script-observer',
        title: 'Act I: Night Rotation at Koto Wharf',
        subtitle: 'Kịch bản bấm máy — Thoại & Mặt bằng bối cảnh',
        pages: [
          {
            pageNumber: 1,
            header: 'KẺ QUAN SÁT — MÀN I',
            type: 'screenplay',
            content: [
              'CẢNH 4. NỘI CẢNH. KHO LƯU TRỮ HỒ SƠ — 02:40 SÁNG',
              'Ánh đèn huỳnh quang rung nhẹ ở tần số 60 Hertz. Những dãy kệ kim loại cao kịch trần trải dài hun hút vào bóng tối xám xanh.',
              'KENICHI (52 tuổi, đồng phục bảo vệ, chùm chìa khóa móc vào thắt lưng đồng) dập đồng hồ tuần tra cơ học tại Trạm số 7.',
              'Đồng hồ phát ra một tiếng CẠCH kim loại khô khốc.',
              'Kenichi khựng lại. Ông hướng tai về phía Lối đi số 14. Một tiếng trượt kim loại xa xăm—như một ngăn kéo vi phim đang được kéo nhẹ trên ổ bi bôi trơn.',
              'KENICHI',
              'Ca ba đã kết thúc hai mươi phút trước. Đèn hành lang đã khóa.',
              'Không có tiếng trả lời. Chỉ có những giọt nước ngưng tụ lạnh ngắt nhỏ tong tỏng xuống dầm thép.',
            ],
          },
          {
            pageNumber: 2,
            header: 'KẺ QUAN SÁT — MÀN I',
            type: 'screenplay',
            content: [
              'CẢNH 5. NỘI CẢNH. PHÒNG GIÁM SÁT — TIẾP NỐI',
              'Mười hai màn hình CRT đơn sắc phát sáng với những vệt nhiễu tĩnh điện. Camera 4 (đường hầm tầng hầm) hiển thị một hành lang trống rỗng.',
              'Kenichi ngồi xuống và liếc nhìn dãy màn hình. Trong hình ảnh phản chiếu trên mặt kính, ông thấy ai đó đang đứng ngay sau vai mình.',
              'Ông xoay phắt chiếc ghế xoay lại.',
              'Căn phòng hoàn toàn trống không. Cửa thép bảo vệ vẫn cài then đôi từ bên trong.',
            ],
          },
        ],
      },
      {
        id: 'directors-essay',
        title: 'Chapter II: Paranoia and Reinforced Concrete',
        subtitle: 'Sổ tay đạo diễn về nỗi sợ hãi kiến trúc hiện đại',
        pages: [
          {
            pageNumber: 3,
            header: 'NGHỆ THUẬT QUAY PHIM KIẾN TRÚC',
            type: 'prose',
            content: [
              'Trong Kẻ Quan Sát, kiến trúc không phải là cảnh nền—nó chính là nhân vật phản diện. Những tòa nhà bê tông cốt thép của thập niên 1960 được xây dựng với những ô lưới giám sát, nhưng chính chúng lại tạo ra những góc mù sâu hoắm.',
              'Chúng tôi đặt máy quay ngang tầm thắt lưng trên giá dolly gang đúc nặng, lướt song song với các tủ hồ sơ. Người xem dần nhận ra rằng mỗi khung hình đều được quay từ góc nhìn của một kẻ đang ẩn nấp sau cây cột gần nhất.',
            ],
          },
        ],
      },
    ],
  },
  valley: {
    filmId: 'valley',
    filmTitle: 'The Silent Valley',
    romaji: 'SHIZUKANA TANI',
    kanji: '静かな谷',
    year: 1958,
    edition: 'Phụ Bản Phục Chế — Hokkaido Arts Foundation',
    totalChapters: 2,
    chapters: [
      {
        id: 'script-valley',
        title: 'Prologue: The Exiled Teacher',
        subtitle: 'Kịch bản gốc — Mùa đông năm 1957',
        pages: [
          {
            pageNumber: 1,
            header: 'THUNG LŨNG TĨNH LẶNG — MỞ ĐẦU',
            type: 'screenplay',
            content: [
              'CẢNH 1. NGOẠI CẢNH. ĐÈO NÚI — HOÀNG HÔN',
              'Tuyết phủ dày. Một cỗ xe trượt tuyết do ngựa kéo di chuyển nhọc nhằn qua rừng tuyết tùng.',
              'SHIZUKO (28 tuổi, áo khoác len, tay ôm một hộp gỗ đánh dầu) nhìn những làn khói bốc lên từ những ống khói xa xăm của làng Hirasawa.',
              'NGƯỜI LÁI XE',
              'Họ không còn gióng chuông trường học kể từ ngày cha cô bước lên chuyến tàu mười hai năm trước.',
              'SHIZUKO',
              'Vậy thì có lẽ họ đã quên mất cao độ của nốt nhạc đó rồi.',
            ],
          },
          {
            pageNumber: 2,
            header: 'THUNG LŨNG TĨNH LẶNG — NHẬT KÝ SẢN XUẤT',
            type: 'prose',
            content: [
              'Tác phẩm đầu tay của Vasari được quay tại thực địa ở phía bắc Nagano trong mùa đông khắc nghiệt năm 1957.',
              'Sử dụng ánh sáng tự nhiên xuyên qua tán tuyết tùng và đèn lồng dầu paraffin, bộ phim đã xác lập phong cách bậc thầy của Vasari về khoảng lặng, chất cảm trang giấy và những bí mật làng quê.',
            ],
          },
        ],
      },
    ],
  },
};

// Generic fallback generator for remaining films
export function getEbookForFilm(
  filmId: string,
  title: string,
  romaji: string,
  kanji: string,
  year: number,
  genre: string,
  synopsis: string
): FilmEbook {
  if (EBOOK_DATABASE[filmId]) {
    return EBOOK_DATABASE[filmId];
  }

  return {
    filmId,
    filmTitle: title,
    romaji,
    kanji,
    year,
    edition: `Bộ Phụ Bản Lưu Trữ Vasari — Tập ${year - 1950}`,
    totalChapters: 2,
    chapters: [
      {
        id: `script-${filmId}`,
        title: `Act I: The Archival Script`,
        subtitle: `Trích đoạn kịch bản gốc (${year})`,
        pages: [
          {
            pageNumber: 1,
            header: `${title.toUpperCase()} — BẢN THẢO BẤM MÁY`,
            type: 'screenplay',
            content: [
              `CẢNH 1. NGOẠI CẢNH. ĐƯỜNG CHÂN TRỜI RỘNG MỞ — ${year}`,
              `Sương mai tụ lại trên mặt đất. Không khí lạnh giá và tiếng nước chảy xa xăm.`,
              `Máy quay đứng yên tại chỗ, để cho sự tĩnh lặng dần lắng đọng.`,
              `Một bóng người bước vào từ mép phải khung hình, mang theo sức nặng của những chuyện dở dang.`,
              `NGƯỜI DẪN CHUYỆN (LỒNG TIẾNG)`,
              `"${synopsis}"`,
              `Một khoảng lặng kéo dài. Ánh sáng từ từ dịch chuyển qua những phiến đá.`,
            ],
          },
          {
            pageNumber: 2,
            header: `${title.toUpperCase()} — CẢNH 2`,
            type: 'screenplay',
            content: [
              `CẢNH 2. NỘI CẢNH. GIAN PHÒNG KHUẤT BÓNG — TIẾP NỐI`,
              `Căn phòng chất đầy những kệ gỗ và hồ sơ giấy. Ánh nắng rọi xiên qua sàn nhà.`,
              `NHÂN VẬT A`,
              `Chúng ta đã đồng ý không bao giờ mở cánh cửa này khi dòng sông đang cuộn sóng.`,
              `NHÂN VẬT B`,
              `Dòng sông đã cạn từ mùa thu rồi. Hãy nhìn ra cửa sổ nếu anh còn hoài nghi.`,
              `Họ đứng ở hai đầu căn phòng, lắng nghe sự im lặng.`,
            ],
          },
        ],
      },
      {
        id: `notes-${filmId}`,
        title: `Chapter II: Production Notes & Curatorial Essay`,
        subtitle: `Phân tích lịch sử bởi Quỹ Điện Ảnh Vasari`,
        pages: [
          {
            pageNumber: 3,
            header: `NGHIÊN CỨU GIÁM TUYỂN — ${(genre || '').toUpperCase()} (19${year % 100})`,
            type: 'prose',
            content: [
              `"${title}" đánh dấu bước chuyển mình quan trọng trong sự nghiệp điện ảnh của Leon Vasari. Thuộc thể loại ${genre.toLowerCase()}, tác phẩm giải cấu trúc những cơ chế thể loại thông thường để nhường chỗ cho sự chiêm nghiệm không gian và căng thẳng tâm lý sâu sắc.`,
              `Được quay trên phim nhựa 35mm đơn sắc trước khi được chuyển sang băng từ master vào thập niên 1980, bộ phim thể hiện triết lý của Vasari rằng điện ảnh phải thở cùng nhịp điệu của những dòng văn tự viết tay.`,
              `Ghi chú phục chế lưu trữ: Các cuộn âm thanh gốc được phục chế ở tần số 96kHz/24-bit với mức can thiệp tối thiểu để bảo tồn chất âm mộc và tiếng xì đặc trưng của băng từ analogue.`,
            ],
          },
        ],
      },
    ],
  };
}
