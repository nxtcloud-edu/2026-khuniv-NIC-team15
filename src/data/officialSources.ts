import { KyungHeeCollege, KHU_COLLEGES } from '../types';

export interface OfficialPartnerSource {
  handle: string;
  title: string;
  colleges: KyungHeeCollege[] | 'all';
  instagramUrl: string;
  pageUrls: string[];
  searchQuery: string;
  verified: boolean;
}

const ALL: KyungHeeCollege[] = [...KHU_COLLEGES];

/**
 * 국제캠퍼스 공식 학생회만 수집 대상으로 둔다.
 * verified: 학교 홈페이지 또는 해당 학생회 링크트리로 확인된 계정.
 */
export const OFFICIAL_PARTNER_SOURCES: OfficialPartnerSource[] = [
  {
    handle: 'khu_58_route',
    title: '제58대 경희대학교 국제캠퍼스 총학생회 루트',
    colleges: 'all',
    instagramUrl: 'https://www.instagram.com/khu_58_route/',
    pageUrls: ['https://linktr.ee/khu_58_route'],
    searchQuery:
      '경희대학교 국제캠퍼스 총학생회 루트 @khu_58_route 네트워쿠 지역 제휴 업체 혜택 기간 2026',
    verified: true,
  },
  {
    handle: 'khu_sw.union',
    title: '소프트웨어융합대학 학생회',
    colleges: ['소프트웨어융합대학'],
    instagramUrl: 'https://www.instagram.com/khu_sw.union/',
    pageUrls: ['https://linktr.ee/khu_sw.union'],
    searchQuery: '경희대 소프트웨어융합대학 학생회 @khu_sw.union 제휴 업체 혜택 기간 2026',
    verified: true,
  },
  {
    handle: 'khu.kic',
    title: '국제대학 학생회',
    colleges: ['국제대학'],
    instagramUrl: 'https://www.instagram.com/khu.kic/',
    pageUrls: ['https://kic.khu.ac.kr/kic_kor/user/contents/view.do?menuNo=5000027'],
    searchQuery: '경희대학교 국제대학 학생회 @khu.kic 제휴 업체 혜택 기간',
    verified: true,
  },
  {
    handle: 'khu_computing',
    title: '컴퓨터공학부 학생회',
    colleges: ['소프트웨어융합대학'],
    instagramUrl: 'https://www.instagram.com/khu_computing/',
    pageUrls: ['https://linktr.ee/khu_computing'],
    searchQuery: '경희대 컴퓨터공학부 학생회 제휴 지도 혜택 기간',
    verified: true,
  },
  {
    handle: 'khu.e_e',
    title: '전자정보대학 전자공학과 학생회',
    colleges: ['전자정보대학'],
    instagramUrl: 'https://www.instagram.com/khu.e_e/',
    pageUrls: ['https://ee.khu.ac.kr/ee/user/contents/view.do?menuNo=1900041'],
    searchQuery: '경희대 전자공학과 학생회 @khu.e_e 제휴 혜택 기간',
    verified: true,
  },
  {
    handle: 'khu_us_',
    title: '제43대 외국어대학 학생회 us',
    colleges: ['외국어대학'],
    instagramUrl: 'https://www.instagram.com/khu_us_/',
    pageUrls: ['https://foreign.khu.ac.kr/foreign_kor/user/contents/view.do?menuNo=16500032'],
    searchQuery: '경희대학교 외국어대학 학생회 us 인스타그램 제휴 업체 혜택 기간',
    verified: true,
  },
  {
    handle: 'khu_eng_council',
    title: '공과대학 학생회',
    colleges: ['공과대학'],
    instagramUrl: '',
    pageUrls: [],
    searchQuery: '경희대학교 국제캠퍼스 공과대학 학생회 인스타그램 제휴 업체 혜택 기간 2026',
    verified: false,
  },
  {
    handle: 'khu_cas_council',
    title: '응용과학대학 학생회',
    colleges: ['응용과학대학'],
    instagramUrl: '',
    pageUrls: [],
    searchQuery: '경희대학교 응용과학대학 학생회 인스타그램 제휴 업체 혜택 기간 2026',
    verified: false,
  },
  {
    handle: 'khu_cbl_council',
    title: '생명과학대학 학생회',
    colleges: ['생명과학대학'],
    instagramUrl: '',
    pageUrls: [],
    searchQuery: '경희대학교 생명과학대학 학생회 인스타그램 제휴 업체 혜택 기간 2026',
    verified: false,
  },
  {
    handle: 'khu_art_council',
    title: '예술디자인대학 학생회',
    colleges: ['예술디자인대학'],
    instagramUrl: '',
    pageUrls: [],
    searchQuery: '경희대학교 예술디자인대학 학생회 인스타그램 제휴 업체 혜택 기간 2026',
    verified: false,
  },
  {
    handle: 'khu_pe_council',
    title: '체육대학 학생회',
    colleges: ['체육대학'],
    instagramUrl: '',
    pageUrls: [],
    searchQuery: '경희대학교 체육대학 학생회 인스타그램 제휴 업체 혜택 기간 2026',
    verified: false,
  },
];

export const VERIFIED_INSTAGRAM_SOURCES = OFFICIAL_PARTNER_SOURCES.filter((s) => s.verified && s.instagramUrl);

export function collegesForSource(source: OfficialPartnerSource): KyungHeeCollege[] {
  return source.colleges === 'all' ? ALL : source.colleges;
}
