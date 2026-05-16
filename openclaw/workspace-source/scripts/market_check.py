import akshare as ak
import json

def main():
    try:
        df = ak.stock_zh_index_spot_em()
        print("数据列:", df.columns.tolist())
        print(df.to_string())
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()