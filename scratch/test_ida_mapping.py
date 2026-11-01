import pandas as pd

works = pd.read_parquet('AiData/works.parquet')
mps = pd.read_parquet('AiData/mps.parquet')
consts = pd.read_parquet('AiData/constituencies.parquet')

print('Total MPs:', len(mps))
sample_ids = mps['mp_id'].unique()[:20]
for m_id in sample_ids:
    row = mps[mps['mp_id'] == m_id].iloc[0]
    m_name = row['mp_name']
    m_works = works[works['mp_id'] == m_id]
    if len(m_works) > 0:
        top_ida = m_works['ida_name'].value_counts().index[0]
    else:
        top_ida = 'No works'
    print(f"{m_id} | {m_name} -> IDA: {top_ida}")
