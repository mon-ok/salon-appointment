-- ============================================================
-- Seed Data — Lumière Studio
-- Uses a fixed UUID so VITE_SALON_ID can be hardcoded for dev
-- ============================================================

-- Salon
insert into salons (id, name, address, phone, email) values (
  '00000000-0000-0000-0000-000000000001',
  'Lumière Studio',
  '123 Beauty Lane, Los Angeles, CA 90001',
  '+1 (310) 555-0192',
  'hello@lumierestudio.com'
) on conflict (id) do nothing;

-- ────────────────────────────────────────
-- Staff
-- ────────────────────────────────────────
insert into staff (id, salon_id, name, role, bio, is_available) values
  ('10000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000001',
   'Isabelle Morin',
   'Master Colorist',
   '12 years of experience specialising in dimensional balayage and colour correction. Isabelle brings Parisian flair to every look.',
   true),

  ('10000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000001',
   'Camille Torres',
   'Hair Stylist & Extensions',
   'Certified in keratin treatments and tape-in extensions. Camille''s precision cuts have earned her a loyal clientele.',
   true),

  ('10000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000001',
   'Naomi Lee',
   'Nail Technician',
   'Nail artist with a passion for intricate gel designs. Naomi holds certifications in bio-sculpture and gel overlays.',
   true),

  ('10000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0000-000000000001',
   'Priya Sharma',
   'Skin & Beauty Therapist',
   'Holistic skin expert trained in advanced facials, microdermabrasion, and brow artistry. Priya believes beauty starts with skin health.',
   true),

  ('10000000-0000-0000-0000-000000000005',
   '00000000-0000-0000-0000-000000000001',
   'Zoe Petit',
   'Junior Stylist',
   'Rising star with a talent for lived-in blondes and fresh cuts. Zoe graduated top of her class from the Academy of Cosmetology.',
   true)
on conflict (id) do nothing;

-- ────────────────────────────────────────
-- Services
-- ────────────────────────────────────────
insert into services (id, salon_id, name, category, description, price, duration_minutes) values

-- HAIR
  ('20000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000001',
   'Signature Balayage',
   'Hair',
   'Hand-painted highlights crafted to frame your face and add sun-kissed dimension. Includes toning and a gloss finish.',
   185.00, 180),

  ('20000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000001',
   'Full Highlights',
   'Hair',
   'Complete foil highlights for all-over brightness and vibrancy. Personalised to your hair type and desired look.',
   155.00, 150),

  ('20000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000001',
   'Cut & Blowdry',
   'Hair',
   'A precision cut followed by a luxurious blowdry and style. Leave the salon looking and feeling your best.',
   75.00, 60),

  ('20000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0000-000000000001',
   'Keratin Treatment',
   'Hair',
   'Smooth, frizz-free hair for up to 12 weeks. Restores shine and manageability with our premium formulation.',
   250.00, 150),

-- NAILS
  ('20000000-0000-0000-0000-000000000005',
   '00000000-0000-0000-0000-000000000001',
   'Gel Manicure',
   'Nails',
   'Long-lasting gel polish in your chosen shade. Includes cuticle care, shaping, and a glossy or matte top coat.',
   55.00, 60),

  ('20000000-0000-0000-0000-000000000006',
   '00000000-0000-0000-0000-000000000001',
   'Luxury Spa Pedicure',
   'Nails',
   'A full foot soak, scrub, massage, and polish for perfectly pampered feet. Elevate it with a paraffin wax add-on.',
   70.00, 75),

  ('20000000-0000-0000-0000-000000000007',
   '00000000-0000-0000-0000-000000000001',
   'Nail Art Design',
   'Nails',
   'Bespoke hand-painted nail art tailored to your style — from minimalist florals to bold geometric patterns.',
   85.00, 90),

  ('20000000-0000-0000-0000-000000000008',
   '00000000-0000-0000-0000-000000000001',
   'Acrylic Full Set',
   'Nails',
   'Full acrylic set with your choice of length, shape, and finish. Includes gel overlay for extra strength.',
   95.00, 90),

-- SKIN
  ('20000000-0000-0000-0000-000000000009',
   '00000000-0000-0000-0000-000000000001',
   'Signature Glow Facial',
   'Skin',
   'Our most popular treatment — deep cleanse, enzyme exfoliation, vitamin C serum, and LED light therapy for an instant glow.',
   120.00, 75),

  ('20000000-0000-0000-0000-000000000010',
   '00000000-0000-0000-0000-000000000001',
   'Brow Lamination & Tint',
   'Skin',
   'Achieve fluffy, full brows with lamination and a tint to define and enhance your natural shape.',
   65.00, 45),

  ('20000000-0000-0000-0000-000000000011',
   '00000000-0000-0000-0000-000000000001',
   'Lash Lift & Tint',
   'Skin',
   'Curl, lift, and tint your natural lashes for a mascara-free look that lasts up to 8 weeks.',
   80.00, 60),

  ('20000000-0000-0000-0000-000000000012',
   '00000000-0000-0000-0000-000000000001',
   'Microdermabrasion',
   'Skin',
   'Crystal-free diamond-tip exfoliation that resurfaces skin, reduces fine lines, and evens skin tone.',
   110.00, 60)

on conflict (id) do nothing;

-- ────────────────────────────────────────
-- Staff ↔ Services mappings
-- ────────────────────────────────────────

-- Isabelle: Hair services
insert into staff_services (staff_id, service_id) values
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004')
on conflict do nothing;

-- Camille: Hair services
insert into staff_services (staff_id, service_id) values
  ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003'),
  ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004')
on conflict do nothing;

-- Naomi: Nail services
insert into staff_services (staff_id, service_id) values
  ('10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005'),
  ('10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000006'),
  ('10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000007'),
  ('10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000008')
on conflict do nothing;

-- Priya: Skin + Brow/Lash services
insert into staff_services (staff_id, service_id) values
  ('10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000009'),
  ('10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000010'),
  ('10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000011'),
  ('10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000012')
on conflict do nothing;

-- Zoe: Hair (junior range)
insert into staff_services (staff_id, service_id) values
  ('10000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003')
on conflict do nothing;
