import sys
import mysql.connector
from mysql.connector import Error
from rich.console import Console
from rich.table import Table
from rich.prompt import Prompt
from rich.panel import Panel
from rich.text import Text

console = Console()

def get_connection():
    """Connects to Manticore Search using the MySQL protocol."""
    try:
        connection = mysql.connector.connect(
            host="127.0.0.1",
            port=9306,
            user="root",
            password=""
        )
        return connection
    except Error as e:
        console.print(f"[bold red]Connection Error:[/] Could not connect to Manticore Search on 127.0.0.1:9306.\nError details: {e}")
        sys.exit(1)

def show_tables(conn):
    """Fetch and display all tables."""
    cursor = conn.cursor()
    cursor.execute("SHOW TABLES")
    
    tables = [row[0] for row in cursor.fetchall()]
    cursor.close()
    
    if not tables:
        console.print("[yellow]No tables (indexes) found in Manticore.[/]")
        return []
        
    table_ui = Table(title="Available Tables", header_style="bold magenta")
    table_ui.add_column("Number", style="cyan", justify="right")
    table_ui.add_column("Table Name", style="green")
    
    for i, t_name in enumerate(tables, start=1):
        table_ui.add_row(str(i), t_name)
        
    console.print(table_ui)
    return tables

def get_total_rows(conn, table_name):
    """Get the total number of documents in a table."""
    cursor = conn.cursor()
    try:
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        return cursor.fetchone()[0]
    finally:
        cursor.close()

def show_table_stats(conn, table_name):
    """Fetch and display statistics for the given table."""
    cursor = conn.cursor(dictionary=True)
    stats = {}
    
    try:
        # Get total rows
        total_rows = get_total_rows(conn, table_name)
        stats['Total Documents'] = f"{total_rows:,}"
        
        if total_rows == 0:
            console.print(f"[yellow]Table '{table_name}' is empty.[/]")
            return False
            
        # Get table schema to see what columns exist
        cursor.execute(f"DESCRIBE {table_name}")
        columns = [row['Field'] for row in cursor.fetchall()]
        
        # Get table status (size)
        cursor.execute(f"SHOW TABLE {table_name} STATUS")
        for row in cursor.fetchall():
            if row['Variable_name'] == 'disk_bytes':
                disk_mb = int(row['Value']) / (1024 * 1024)
                stats['Disk Size'] = f"{disk_mb:.2f} MB"
            elif row['Variable_name'] == 'ram_bytes':
                ram_mb = int(row['Value']) / (1024 * 1024)
                stats['RAM Usage'] = f"{ram_mb:.2f} MB"
                
        # Get unique videos if column exists
        if 'video_id' in columns:
            cursor.execute(f"SELECT COUNT(DISTINCT video_id) as cnt FROM {table_name}")
            unique_videos = cursor.fetchone()['cnt']
            stats['Unique Videos (No Duplicates)'] = f"{unique_videos:,}"
            
        # Display the main stats
        stat_table = Table(title=f"Dashboard: {table_name}", header_style="bold magenta")
        stat_table.add_column("Metric", style="cyan")
        stat_table.add_column("Value", style="green")
        
        for k, v in stats.items():
            stat_table.add_row(k, str(v))
            
        console.print(stat_table)
        
        # Get categories and channels if columns exist
        if 'category_title' in columns and 'channel' in columns:
            cursor.execute(f"SELECT category_title, channel, COUNT(*) as cnt FROM {table_name} GROUP BY category_title, channel ORDER BY category_title ASC, cnt DESC")
            cat_rows = cursor.fetchall()
            
            cat_table = Table(title="Categories & Channels Breakdown", header_style="bold magenta")
            cat_table.add_column("Category", style="cyan")
            cat_table.add_column("Channel", style="blue")
            cat_table.add_column("Documents", style="green", justify="right")
            
            for row in cat_rows:
                cat_name = row['category_title'] if row['category_title'] else "[i]Uncategorized[/i]"
                chan_name = row['channel'] if row['channel'] else "[i]Unknown Channel[/i]"
                cat_table.add_row(cat_name, chan_name, f"{row['cnt']:,}")
                
            console.print("")
            console.print(cat_table)
            
        elif 'category_title' in columns:
            cursor.execute(f"SELECT category_title, COUNT(*) as cnt FROM {table_name} GROUP BY category_title ORDER BY cnt DESC")
            cat_rows = cursor.fetchall()
            
            cat_table = Table(title="Categories Breakdown", header_style="bold magenta")
            cat_table.add_column("Category", style="cyan")
            cat_table.add_column("Documents", style="green", justify="right")
            
            for row in cat_rows:
                cat_name = row['category_title'] if row['category_title'] else "[i]Uncategorized[/i]"
                cat_table.add_row(cat_name, f"{row['cnt']:,}")
                
            console.print("")
            console.print(cat_table)

        return True
            
    except Error as e:
        console.print(f"[bold red]Error fetching stats for '{table_name}':[/] {e}")
        return False
    finally:
        cursor.close()

def show_table_data(conn, table_name):
    """Display data from a specific table with pagination and smart wrapping."""
    cursor = conn.cursor(dictionary=True)
    try:
        total_rows = get_total_rows(conn, table_name)
        
        if total_rows == 0:
            console.print(f"[yellow]Table '{table_name}' is empty.[/]")
            return

        page_size = 10
        current_offset = 0
        
        while current_offset < total_rows:
            console.clear()
            
            # Fetch the specific page
            cursor.execute(f"SELECT * FROM {table_name} LIMIT {page_size} OFFSET {current_offset}")
            rows = cursor.fetchall()
            
            if not rows:
                break
                
            column_names = list(rows[0].keys())
            
            # Build a smart table
            data_table = Table(
                title=f"Page {(current_offset // page_size) + 1} of {(total_rows + page_size - 1) // page_size}", 
                header_style="bold magenta",
                show_lines=True
            )
            
            # Smart Column Widths
            for col in column_names:
                if col == 'id':
                    data_table.add_column("id", style="cyan", justify="right", no_wrap=True)
                else:
                    data_table.add_column(col, style="white", no_wrap=True)
                
            for row in rows:
                str_row = []
                for val in row.values():
                    # Handle None/NULL values gracefully
                    if val is None:
                        t_val = Text("NULL", style="dim")
                    else:
                        s_val = str(val).replace("\n", " ").replace("\r", " ").replace("\t", " ")
                        if len(s_val) > 30:
                            s_val = s_val[:27] + "..."
                        t_val = Text(s_val, no_wrap=True, overflow="ellipsis")
                        
                    str_row.append(t_val)
                data_table.add_row(*str_row)
                
            console.print(data_table)
            
            # Pagination Controls
            console.print("\n[dim]Controls: [bold]n[/]ext page, [bold]p[/]revious page, [bold]q[/]uit to menu[/dim]")
            action = Prompt.ask("Action", choices=["n", "p", "q", ""], default="n")
            
            if action == "q":
                break
            elif action == "n" or action == "": # Default to next page if they just hit enter
                if current_offset + page_size < total_rows:
                    current_offset += page_size
                else:
                    console.print("[yellow]You are at the last page![/]")
                    Prompt.ask("Press Enter to continue")
            elif action == "p":
                if current_offset >= page_size:
                    current_offset -= page_size
                else:
                    console.print("[yellow]You are already on the first page![/]")
                    Prompt.ask("Press Enter to continue")

    except Error as e:
        console.print(f"[bold red]Error querying table '{table_name}':[/] {e}")
        Prompt.ask("Press Enter to continue")
    finally:
        cursor.close()

def main():
    console.clear()
    console.print(Panel.fit("[bold cyan]Welcome to Manticore Search TUI Manager[/]", border_style="blue"))
    
    try:
        conn = get_connection()
        console.print("[green]Successfully connected to Manticore Search![/]\n")
        
        while True:
            tables = show_tables(conn)
            
            if not tables:
                console.print("\n[dim]Press Enter to quit.[/]")
                input()
                break
                
            console.print("\n[dim]Enter 'q' or '0' at any time to quit.[/]")
            choice = Prompt.ask("Select a table by [bold cyan]Number[/] to view its data", default="q")
            
            if choice.lower() in ['q', '0', 'quit', 'exit']:
                console.print("[yellow]Exiting Manticore Manager. Goodbye![/]")
                break
                
            if choice.isdigit():
                choice_idx = int(choice) - 1
                if 0 <= choice_idx < len(tables):
                    selected_table = tables[choice_idx]
                    console.clear()
                    
                    has_data = show_table_stats(conn, selected_table)
                    if has_data:
                        console.print("\n[dim]Choose what to do next:[/dim]")
                        action = Prompt.ask("Press [bold]Enter[/] to view rows, or [bold]q[/] to return to menu", choices=["", "q"], default="")
                        if action == "":
                            show_table_data(conn, selected_table)
                    
                    console.clear()
                else:
                    console.print(f"[bold red]Invalid number. Please enter a number between 1 and {len(tables)}[/]")
            else:
                console.print("[bold red]Please enter a valid number or 'q' to quit.[/]")
                
        if conn.is_connected():
            conn.close()
            
    except KeyboardInterrupt:
        console.print("\n[yellow]Forced exit. Goodbye![/]")
        sys.exit(0)

if __name__ == "__main__":
    main()
