import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา | Lumière Jewelry",
  description: "รู้จักกับ Lumière Jewelry ร้านจิวเวลรี่ชั้นนำที่คัดสรรเครื่องประดับคุณภาพสูงจากวัสดุชั้นดี",
};

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-gray-800 mb-8 text-center">
          เรื่องราวของเรา
        </h1>

        <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-12 bg-gray-100">
          <img
            src="https://images.unsplash.com/photo-1589674781759-c21a91d6d2e3?w=1200&q=80"
            alt="Lumière Jewelry Workshop"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            ยินดีต้อนรับสู่ <strong className="text-gold-700">Lumière Jewelry</strong> 
            &mdash; ที่ซึ่งความงามและคุณค่ามาบรรจบกันในทุกชิ้นงาน เราเป็นร้านจิวเวลรี่ที่ 
            ดำเนินกิจการด้วยความรักและความหลงใหลในเครื่องประดับชั้นสูง
          </p>

          <p className="text-gray-600 leading-relaxed mb-6">
            จุดเริ่มต้นของ Lumière เกิดขึ้นจากความต้องการที่จะนำเสนอเครื่องประดับ 
            ที่ไม่เพียงแต่สวยงาม แต่ยังเต็มไปด้วยคุณค่าทางจิตใจ ทุกชิ้นงานที่เรา 
            คัดสรรมานั้นผ่านการพิจารณาอย่างพิถีพิถัน ทั้งในเรื่องของวัสดุ การออกแบบ 
            และฝีมือการผลิต
          </p>

          <h2 className="text-2xl font-serif font-bold text-gray-800 mt-12 mb-6">
            ปรัชญาของเรา
          </h2>

          <p className="text-gray-600 leading-relaxed mb-6">
            เราเชื่อว่าเครื่องประดับที่ดีควรเป็นมากกว่าแค่เครื่องประดับ 
            มันควรเป็นตัวแทนของความทรงจำ ความรัก และช่วงเวลาพิเศษในชีวิต 
            ไม่ว่าจะเป็นแหวนหมั้น สร้อยคอของขวัญ หรือเครื่องประดับสำหรับวันสำคัญ 
            ทุกชิ้นงานจาก Lumière ถูกสร้างขึ้นเพื่อให้คุณเปล่งประกายในทุกโอกาส
          </p>

          <div className="grid sm:grid-cols-3 gap-8 my-12">
            <div className="text-center">
              <div className="text-4xl font-serif font-bold text-gold-700 mb-2">
                คุณภาพ
              </div>
              <p className="text-gray-500 text-sm">
                คัดสรรวัสดุชั้นดีจากแหล่งที่เชื่อถือได้
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-serif font-bold text-gold-700 mb-2">
                ดีไซน์
              </div>
              <p className="text-gray-500 text-sm">
                ออกแบบอย่างประณีต หรูหรา และเหนือกาลเวลา
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-serif font-bold text-gold-700 mb-2">
                เชื่อถือได้
              </div>
              <p className="text-gray-500 text-sm">
                บริการหลังการขายที่อบอุ่นและเป็นกันเอง
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-serif font-bold text-gray-800 mt-12 mb-6">
            ความมุ่งมั่นของเรา
          </h2>

          <p className="text-gray-600 leading-relaxed mb-6">
            ที่ Lumière เรามุ่งมั่นที่จะมอบประสบการณ์การช้อปปิ้งที่ดีที่สุดให้กับคุณ 
            ตั้งแต่การเลือกชมสินค้าออนไลน์ การให้คำปรึกษาโดยผู้เชี่ยวชาญ 
            ไปจนถึงการจัดส่งที่ปลอดภัยและรวดเร็ว เราพร้อมดูแลคุณในทุกขั้นตอน
          </p>

          <p className="text-gray-600 leading-relaxed">
            ขอบคุณที่ไว้วางใจให้เราเป็นส่วนหนึ่งใน moments พิเศษของคุณ
          </p>
        </div>
      </div>
    </div>
  );
}
