import { MigrationInterface, QueryRunner } from 'typeorm';

const TYPES: [code: string, name: string, category: string, requiresExpiration: boolean, alertDays: number | null][] = [
  ['GUIA_DAS', 'Guia DAS (Simples Nacional)', 'GUIAS', true, 5],
  ['GUIA_DARF', 'Guia DARF', 'GUIAS', true, 5],
  ['GUIA_FGTS', 'Guia FGTS', 'GUIAS', true, 5],
  ['GUIA_ISS', 'Guia ISS', 'GUIAS', true, 5],
  ['GUIA_ICMS', 'Guia ICMS', 'GUIAS', true, 5],
  ['FOLHA_PAGAMENTO', 'Folha de pagamento', 'TRABALHISTA', false, null],
  ['HOLERITE', 'Holerite', 'TRABALHISTA', false, null],
  ['BALANCETE', 'Balancete', 'CONTABIL', false, null],
  ['BALANCO_DRE', 'Balanço Patrimonial e DRE', 'CONTABIL', false, null],
];

export class SeedPortalDocumentTypes1792024455686 implements MigrationInterface {
  name = 'SeedPortalDocumentTypes1792024455686';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [code, name, category, requiresExpiration, alertDays] of TYPES) {
      await queryRunner.query(
        `INSERT INTO "document_types" ("code", "name", "category", "requires_expiration", "default_alert_days", "active", "createdBy")
         VALUES ($1, $2, $3, $4, $5, true, 'system')
         ON CONFLICT ("code") DO NOTHING`,
        [code, name, category, requiresExpiration, alertDays],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "document_types" WHERE "createdBy" = 'system' AND "code" = ANY($1)`,
      [TYPES.map(([code]) => code)],
    );
  }
}
